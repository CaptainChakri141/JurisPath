import os
import re
import time
import unicodedata
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

# Maximum allowed file upload size (15 MB)
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024

# Allowed file extensions
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}

# Known file signatures (magic bytes)
PDF_MAGIC = b"%PDF-"
ZIP_MAGIC = b"PK\x03\x04"  # DOCX is an OpenXML ZIP archive
EXE_MAGIC = b"MZ"
ELF_MAGIC = b"\x7fELF"


def sanitize_filename(raw_filename: str) -> str:
    """
    Sanitizes filename to prevent directory traversal, null-byte injection,
    and filesystem attacks.
    """
    if not raw_filename:
        return "unnamed_document.txt"

    # Remove path traversal characters
    cleaned = os.path.basename(raw_filename)
    cleaned = cleaned.replace("..", "").replace("/", "").replace("\\", "").replace("\x00", "")

    # Normalize unicode
    cleaned = unicodedata.normalize("NFKD", cleaned).encode("ascii", "ignore").decode("ascii")

    # Keep only safe alphanumeric, dots, dashes, underscores, and spaces
    cleaned = re.sub(r'[^a-zA-Z0-9_\-\. ]', '_', cleaned).strip()

    # Limit filename length
    if len(cleaned) > 120:
        base, ext = os.path.splitext(cleaned)
        cleaned = base[:110] + ext

    return cleaned or "document.txt"


def validate_uploaded_file(content: bytes, filename: str) -> Tuple[str, str]:
    """
    Validates file size, extension, and magic bytes.
    Returns (sanitized_filename, detected_file_type).
    Raises HTTPException on validation failure.
    """
    # 1. Size check
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB"
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty"
        )

    # 2. Filename and extension check
    safe_filename = sanitize_filename(filename)
    ext = os.path.splitext(safe_filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # 3. Magic byte signature verification
    if content.startswith(EXE_MAGIC) or content.startswith(ELF_MAGIC):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Binary executables are strictly rejected for security."
        )

    if ext == ".pdf":
        if not content.startswith(PDF_MAGIC):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid PDF format: file header does not match PDF signature."
            )
        file_type = "PDF"
    elif ext in [".docx", ".doc"]:
        if not content.startswith(ZIP_MAGIC):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid DOCX format: file header does not match OpenXML archive signature."
            )
        file_type = "DOCX"
    else:
        # TXT validation
        if b"\x00" in content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid text document: contains illegal binary null bytes."
            )
        file_type = "TXT"

    return safe_filename, file_type


def sanitize_input_text(text: str, max_length: int = 2000) -> str:
    """Sanitizes user input text queries and answers."""
    if not text:
        return ""
    # Strip dangerous control characters while preserving newlines and tabs
    sanitized = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    sanitized = sanitized.strip()
    return sanitized[:max_length]


class RateLimiter:
    """
    Sliding window in-memory rate limiter per IP address.
    """
    def __init__(self, max_requests: int = 120, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        window_start = now - self.window_seconds
        
        # Prune old timestamps
        timestamps = [t for t in self.requests[client_ip] if t > window_start]
        self.requests[client_ip] = timestamps

        if len(timestamps) >= self.max_requests:
            return False

        self.requests[client_ip].append(now)
        return True

    def get_retry_after(self, client_ip: str) -> int:
        if not self.requests[client_ip]:
            return 1
        now = time.time()
        oldest = min(self.requests[client_ip])
        return max(1, int(self.window_seconds - (now - oldest)))


# Global rate limiters
general_rate_limiter = RateLimiter(max_requests=120, window_seconds=60)
ai_rate_limiter = RateLimiter(max_requests=30, window_seconds=60)


class SecurityMiddleware(BaseHTTPMiddleware):
    """
    Applies security headers and rate limiting across all incoming requests.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host if request.client else "unknown"

        # Rate limit AI and upload endpoints more strictly
        path = request.url.path
        if "/api/documents/" in path and ("/ask" in path or "/upload" in path):
            if not ai_rate_limiter.is_allowed(client_ip):
                retry_after = ai_rate_limiter.get_retry_after(client_ip)
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Too many requests to AI/upload endpoints. Please slow down."},
                    headers={"Retry-After": str(retry_after)}
                )
        else:
            if not general_rate_limiter.is_allowed(client_ip):
                retry_after = general_rate_limiter.get_retry_after(client_ip)
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Rate limit exceeded. Please wait before retrying."},
                    headers={"Retry-After": str(retry_after)}
                )

        response = await call_next(request)

        # Enforce secure headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"

        return response
