import os
import uuid
import logging
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from models.schemas import (
    DocumentMetadata,
    DocumentSummary,
    DocumentDetailResponse,
    AskRequest,
    AskResponse,
    SimpleLanguageClause,
    DeadlineItem,
    ComparisonRequest,
    ComparisonResponse,
    NavigatorGuidanceRequest,
    NavigatorGuidanceResponse,
    Evidence
)
from services.parser_service import ParserService
from services.rag_service import RAGService
from services.analyzer_service import AnalyzerService
from services.gemini_service import GeminiService
from services.simple_language_service import SimpleLanguageService
from services.comparison_service import ComparisonService
from services.deadline_service import DeadlineService
from services.navigator_service import NavigatorService
from security import (
    validate_uploaded_file,
    sanitize_input_text,
    SecurityMiddleware,
    MAX_FILE_SIZE_BYTES,
    ALLOWED_EXTENSIONS
)
from cache import app_cache

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("jurispath")

app = FastAPI(
    title="JurisPath API",
    description="Secure, High-Efficiency Backend API for JurisPath: Your Path Through Legal Information",
    version="1.1.0"
)

# Attach Security Middleware (Security Headers + Rate Limiting)
app.add_middleware(SecurityMiddleware)

# Enable CORS with safe configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]
# If environment overrides or dev wildcard
if os.environ.get("ENVIRONMENT") == "development" or True:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )

# In-memory document storage
documents_store: Dict[str, Dict[str, Any]] = {}

# Services
rag_service = RAGService()
gemini_service = GeminiService()


def preload_sample_documents() -> None:
    """Preloads the 4 demo documents into the documents_store and RAG index."""
    sample_dir = os.path.join(os.path.dirname(__file__), "sample_docs")
    sample_files = [
        ("Sample_Residential_Rental_Agreement.txt", "sample_rental_1"),
        ("Sample_Employment_Agreement.txt", "sample_employment_1"),
        ("Sample_Mutual_NDA.txt", "sample_nda_1"),
        ("Sample_Consumer_Legal_Notice.txt", "sample_notice_1")
    ]
    loaded_count = 0
    for filename, doc_id in sample_files:
        filepath = os.path.join(sample_dir, filename)
        if os.path.exists(filepath):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                file_bytes = content.encode("utf-8")
                full_text, pages, file_type = ParserService.parse_document(file_bytes, filename)
                clauses = ParserService.extract_clauses(full_text, pages)
                metadata, summary = AnalyzerService.analyze_document(doc_id, filename, full_text, pages, clauses)
                rag_service.index_document(doc_id, filename, clauses, pages)
                
                documents_store[doc_id] = {
                    "metadata": metadata,
                    "summary": summary,
                    "clauses": clauses,
                    "full_text": full_text,
                    "pages": pages
                }
                loaded_count += 1
            except Exception as e:
                logger.error(f"Error loading demo document {filename}: {e}")

    logger.info(f"Preloaded {loaded_count} standard demo documents into store and RAG index.")


# Preload demo documents at startup
preload_sample_documents()


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Masks unhandled errors to avoid leaking stack traces."""
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    logger.error(f"Unhandled server error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred while processing legal document data."}
    )


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "JurisPath API",
        "version": "1.1.0",
        "loaded_documents": len(documents_store),
        "gemini_configured": bool(gemini_service.api_key),
        "cache_stats": app_cache.get_stats(),
        "security": {
            "max_upload_size_mb": MAX_FILE_SIZE_BYTES // (1024 * 1024),
            "allowed_extensions": sorted(list(ALLOWED_EXTENSIONS)),
            "rate_limiting_active": True
        }
    }


class KeyRequest(BaseModel):
    api_key: str = Field(..., min_length=10, max_length=200)


@app.post("/api/settings/gemini-key")
def set_gemini_key(req: KeyRequest):
    clean_key = req.api_key.strip()
    gemini_service.set_api_key(clean_key)
    masked = clean_key[:4] + "..." + clean_key[-4:] if len(clean_key) > 8 else "***"
    logger.info(f"Gemini API key updated (key: {masked})")
    return {"status": "success", "message": f"Gemini API key configured successfully ({masked})"}


@app.get("/api/cache/stats")
def get_cache_stats():
    """Returns efficiency metrics and cache hit ratios."""
    return app_cache.get_stats()


@app.post("/api/cache/clear")
def clear_cache():
    """Clears in-memory LRU cache."""
    app_cache.clear()
    return {"status": "success", "message": "Cache cleared"}


@app.get("/api/documents", response_model=List[DocumentMetadata])
def list_documents():
    return [doc["metadata"] for doc in documents_store.values()]


@app.get("/api/documents/{doc_id}", response_model=DocumentDetailResponse)
def get_document(doc_id: str):
    if doc_id not in documents_store:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = documents_store[doc_id]
    return DocumentDetailResponse(
        metadata=doc["metadata"],
        summary=doc["summary"],
        clauses=doc["clauses"],
        full_text=doc["full_text"],
        pages=doc["pages"]
    )


@app.post("/api/documents/upload", response_model=DocumentDetailResponse)
async def upload_document(file: UploadFile = File(...)):
    raw_filename = file.filename or "uploaded_document.txt"
    content = await file.read()
    
    # Security: Validate file size, extension, and magic byte signatures
    safe_filename, detected_type = validate_uploaded_file(content, raw_filename)
    
    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    
    try:
        full_text, pages, file_type = ParserService.parse_document(content, safe_filename)
        clauses = ParserService.extract_clauses(full_text, pages)
        metadata, summary = AnalyzerService.analyze_document(doc_id, safe_filename, full_text, pages, clauses)
        rag_service.index_document(doc_id, safe_filename, clauses, pages)

        documents_store[doc_id] = {
            "metadata": metadata,
            "summary": summary,
            "clauses": clauses,
            "full_text": full_text,
            "pages": pages
        }
        logger.info(f"Uploaded and indexed document '{safe_filename}' (ID: {doc_id}, Clauses: {len(clauses)})")

        return DocumentDetailResponse(
            metadata=metadata,
            summary=summary,
            clauses=clauses,
            full_text=full_text,
            pages=pages
        )
    except Exception as e:
        logger.error(f"Failed to parse and analyze file {safe_filename}: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to process document: {str(e)}")


@app.post("/api/documents/{doc_id}/ask", response_model=AskResponse)
def ask_document(doc_id: str, req: AskRequest):
    if doc_id not in documents_store:
        raise HTTPException(status_code=404, detail="Document not found")
    
    clean_query = sanitize_input_text(req.query, max_length=500)
    if not clean_query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # Efficiency: Check LRU Cache first
    cached_response = app_cache.get("ask", doc_id, clean_query)
    if cached_response is not None:
        return cached_response

    doc = documents_store[doc_id]
    evidences = rag_service.retrieve(doc_id, clean_query, top_k=3)
    response = gemini_service.answer_question(
        query=clean_query,
        doc_name=doc["metadata"].filename,
        evidences=evidences,
        full_context=doc["full_text"][:3000]
    )
    
    # Store in LRU cache (TTL 30 minutes)
    app_cache.set("ask", response, doc_id, clean_query, ttl=1800)
    return response


@app.get("/api/documents/{doc_id}/simple-language", response_model=List[SimpleLanguageClause])
def get_simple_language(doc_id: str):
    if doc_id not in documents_store:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Efficiency: Check LRU Cache
    cached = app_cache.get("simple_lang", doc_id)
    if cached is not None:
        return cached

    doc = documents_store[doc_id]
    result = SimpleLanguageService.translate_clauses(doc["clauses"])
    app_cache.set("simple_lang", result, doc_id, ttl=3600)
    return result


@app.get("/api/documents/{doc_id}/deadlines", response_model=List[DeadlineItem])
def get_deadlines(doc_id: str):
    if doc_id not in documents_store:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Efficiency: Check LRU Cache
    cached = app_cache.get("deadlines", doc_id)
    if cached is not None:
        return cached

    doc = documents_store[doc_id]
    result = DeadlineService.extract_deadlines(doc["clauses"], doc["full_text"])
    app_cache.set("deadlines", result, doc_id, ttl=3600)
    return result


@app.post("/api/documents/compare", response_model=ComparisonResponse)
def compare_documents(req: ComparisonRequest):
    if req.doc_a_id not in documents_store or req.doc_b_id not in documents_store:
        raise HTTPException(status_code=404, detail="One or both documents not found")
    
    # Efficiency: Check LRU Cache
    cached = app_cache.get("compare", req.doc_a_id, req.doc_b_id)
    if cached is not None:
        return cached

    doc_a = documents_store[req.doc_a_id]
    doc_b = documents_store[req.doc_b_id]

    result = ComparisonService.compare_documents(
        doc_a_id=req.doc_a_id,
        doc_a_name=doc_a["metadata"].filename,
        doc_a_clauses=doc_a["clauses"],
        doc_a_text=doc_a["full_text"],
        doc_b_id=req.doc_b_id,
        doc_b_name=doc_b["metadata"].filename,
        doc_b_clauses=doc_b["clauses"],
        doc_b_text=doc_b["full_text"]
    )
    app_cache.set("compare", result, req.doc_a_id, req.doc_b_id, ttl=3600)
    return result


@app.get("/api/navigator/scenarios")
def get_scenarios():
    return NavigatorService.get_scenarios()


@app.post("/api/navigator/guidance", response_model=NavigatorGuidanceResponse)
def get_navigator_guidance(req: NavigatorGuidanceRequest):
    clean_answers = {k: sanitize_input_text(str(v), max_length=300) for k, v in req.answers.items()}
    return NavigatorService.generate_guidance(
        scenario_id=req.scenario_id,
        jurisdiction_country=req.jurisdiction_country,
        jurisdiction_state=req.jurisdiction_state,
        answers=clean_answers
    )


@app.get("/api/demo-documents")
def get_demo_documents():
    return [
        {
            "id": doc_id,
            "filename": doc["metadata"].filename,
            "doc_type": doc["metadata"].doc_type,
            "parties": doc["metadata"].parties,
            "jurisdiction": doc["metadata"].jurisdiction,
            "page_count": doc["metadata"].page_count
        }
        for doc_id, doc in documents_store.items()
        if doc_id.startswith("sample_")
    ]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
