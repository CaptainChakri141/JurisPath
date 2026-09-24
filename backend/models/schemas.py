from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Evidence(BaseModel):
    doc_name: str
    page_number: int
    section_number: str
    section_title: str
    text: str
    similarity_score: Optional[float] = 1.0

class Clause(BaseModel):
    id: str
    section_number: str
    title: str
    text: str
    page_number: int
    category: str = "General"

class DocumentMetadata(BaseModel):
    id: str
    filename: str
    file_type: str
    upload_date: str
    page_count: int
    doc_type: str
    parties: List[str] = []
    jurisdiction: str = "India (Andhra Pradesh)"
    important_dates: List[str] = []
    monetary_values: List[str] = []

class DocumentSummary(BaseModel):
    overview: str
    doc_type: str
    parties: List[str]
    important_obligations: List[str]
    deadlines: List[str]
    payments: List[str]
    clauses_requiring_attention: List[str]
    rights_summary: List[str]
    penalties_summary: List[str]
    termination_summary: str
    dispute_resolution: str

class SimpleLanguageClause(BaseModel):
    section_number: str
    title: str
    original_text: str
    plain_language: str
    practical_meaning: str
    things_to_check: List[str]
    page_number: int

class DeadlineItem(BaseModel):
    id: str
    title: str
    date_str: str
    days_remaining: Optional[int] = None
    category: str  # "Notice Period" | "Payment" | "Expiration" | "Renewal" | "Response"
    urgency: str   # "Urgent" | "Moderate" | "Informational"
    source_page: int
    source_section: str
    source_text: str

class AskRequest(BaseModel):
    query: str
    jurisdiction: Optional[str] = "India (Andhra Pradesh)"

class AskResponse(BaseModel):
    answer: str
    evidences: List[Evidence] = []
    grounding_status: str  # "grounded" | "not_found"
    confidence_score: float = 0.95
    disclaimer: str = (
        "JurisPath provides legal information and document comprehension assistance. "
        "It does not constitute legal advice. Please consult an advocate for legal representation."
    )

class ComparisonRequest(BaseModel):
    doc_a_id: str
    doc_b_id: str

class ComparisonCategory(BaseModel):
    category: str
    doc_a_value: str
    doc_b_value: str
    difference_explanation: str
    impact_analysis: str

class ComparisonResponse(BaseModel):
    doc_a_id: str
    doc_a_title: str
    doc_b_id: str
    doc_b_title: str
    categories: List[ComparisonCategory]
    overall_summary: str
    disclaimer: str = "Comparison is strictly informational. JurisPath never recommends one agreement over another."

class LegalSourceCitation(BaseModel):
    source_name: str
    title: str
    section: str
    official_url: str
    relevance: str

class NavigatorGuidanceRequest(BaseModel):
    scenario_id: str
    jurisdiction_country: str = "India"
    jurisdiction_state: str = "Andhra Pradesh"
    answers: Dict[str, Any]

class NavigatorGuidanceResponse(BaseModel):
    scenario_id: str
    scenario_title: str
    jurisdiction: str
    situation_summary: str
    relevant_statutes: List[LegalSourceCitation]
    documents_to_gather: List[str]
    important_dates_checklist: List[str]
    possible_next_steps: List[str]
    when_professional_help_needed: List[str]
    disclaimer: str = (
        "Legal Navigator provides general informational steps under Indian & State law. "
        "It does not predict legal outcomes or replace an advocate."
    )

class DocumentDetailResponse(BaseModel):
    metadata: DocumentMetadata
    summary: DocumentSummary
    clauses: List[Clause]
    full_text: str
    pages: List[str]
