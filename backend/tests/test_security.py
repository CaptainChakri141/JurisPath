import unittest
import os
import sys
import io

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from main import app
from security import (
    validate_uploaded_file,
    sanitize_filename,
    sanitize_input_text,
    RateLimiter,
    MAX_FILE_SIZE_BYTES
)
from fastapi import HTTPException


class TestSecurity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_filename_sanitization(self):
        # Path traversal sequences
        malicious = "../../../etc/passwd"
        cleaned = sanitize_filename(malicious)
        self.assertNotIn("..", cleaned)
        self.assertNotIn("/", cleaned)
        self.assertNotIn("\\", cleaned)

        # Null bytes
        null_byte_name = "report\x00.exe.txt"
        cleaned = sanitize_filename(null_byte_name)
        self.assertNotIn("\x00", cleaned)

        # Empty fallback
        self.assertEqual(sanitize_filename(""), "unnamed_document.txt")

    def test_input_text_sanitization(self):
        # Control characters
        raw = "Hello\x00\x08World\nThis is safe.\x1f"
        cleaned = sanitize_input_text(raw)
        self.assertEqual(cleaned, "HelloWorld\nThis is safe.")

        # Max length clipping
        long_text = "A" * 3000
        cleaned = sanitize_input_text(long_text, max_length=500)
        self.assertEqual(len(cleaned), 500)

    def test_reject_oversized_file(self):
        oversized_content = b"A" * (MAX_FILE_SIZE_BYTES + 1024)
        with self.assertRaises(HTTPException) as ctx:
            validate_uploaded_file(oversized_content, "large_doc.txt")
        self.assertEqual(ctx.exception.status_code, 413)

    def test_reject_unsupported_file_extension(self):
        content = b"print('hello')"
        with self.assertRaises(HTTPException) as ctx:
            validate_uploaded_file(content, "script.py")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("Unsupported file type", ctx.exception.detail)

    def test_reject_fake_pdf_header(self):
        # File claims to be pdf but has garbage header
        fake_pdf = b"NOT_A_REAL_PDF_HEADER"
        with self.assertRaises(HTTPException) as ctx:
            validate_uploaded_file(fake_pdf, "document.pdf")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("Invalid PDF format", ctx.exception.detail)

    def test_reject_executable_binary(self):
        # Windows PE executable magic 'MZ'
        fake_exe = b"MZ\x90\x00\x03\x00\x00\x00"
        with self.assertRaises(HTTPException) as ctx:
            validate_uploaded_file(fake_exe, "document.txt")
        self.assertEqual(ctx.exception.status_code, 400)

    def test_valid_txt_upload_validation(self):
        valid_txt = b"This is a valid legal document text."
        safe_name, file_type = validate_uploaded_file(valid_txt, "my_agreement.txt")
        self.assertEqual(safe_name, "my_agreement.txt")
        self.assertEqual(file_type, "TXT")

    def test_security_headers_present(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        headers = response.headers
        self.assertEqual(headers.get("x-content-type-options"), "nosniff")
        self.assertEqual(headers.get("x-frame-options"), "DENY")
        self.assertEqual(headers.get("x-xss-protection"), "1; mode=block")
        self.assertEqual(headers.get("referrer-policy"), "strict-origin-when-cross-origin")
        self.assertIn("Content-Security-Policy", headers)

    def test_rate_limiter_unit(self):
        limiter = RateLimiter(max_requests=5, window_seconds=60)
        ip = "192.168.1.50"
        for _ in range(5):
            self.assertTrue(limiter.is_allowed(ip))
        # 6th request should be blocked
        self.assertFalse(limiter.is_allowed(ip))


if __name__ == "__main__":
    unittest.main()
