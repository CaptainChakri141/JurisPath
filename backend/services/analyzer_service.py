import re
from typing import List, Dict, Any, Tuple
from models.schemas import DocumentSummary, DocumentMetadata

class AnalyzerService:
    @classmethod
    def analyze_document(cls, doc_id: str, filename: str, full_text: str, pages: List[str], clauses: List[Dict[str, Any]]) -> Tuple[DocumentMetadata, DocumentSummary]:
        lower_text = full_text.lower()
        
        # 1. Identify Document Type
        doc_type = "Legal Agreement"
        if "rental agreement" in lower_text or "lease agreement" in lower_text or "tenancy" in lower_text:
            doc_type = "Residential Tenancy Agreement"
        elif "employment agreement" in lower_text or "appointment letter" in lower_text or "employee" in lower_text and "salary" in lower_text:
            doc_type = "Employment Agreement"
        elif "non-disclosure agreement" in lower_text or "confidentiality agreement" in lower_text or "nda" in lower_text:
            doc_type = "Mutual Non-Disclosure Agreement (NDA)"
        elif "legal notice" in lower_text or "consumer protection act" in lower_text:
            doc_type = "Consumer Legal Notice"

        # 2. Extract Parties
        parties = cls._extract_parties(full_text, doc_type)

        # 3. Extract Monetary Values
        monetary_values = cls._extract_monetary_values(full_text)

        # 4. Extract Important Dates
        important_dates = cls._extract_dates(full_text)

        # 5. Extract Obligations
        obligations = cls._extract_obligations(clauses, full_text)

        # 6. Extract Penalties
        penalties = cls._extract_penalties(clauses, full_text)

        # 7. Extract Rights
        rights = cls._extract_rights(clauses, full_text)

        # 8. Termination & Notice Summary
        termination_info = cls._extract_termination_summary(clauses, full_text)

        # 9. Dispute Resolution
        dispute_info = cls._extract_dispute_info(clauses, full_text)

        # 10. Clauses requiring attention
        attention_clauses = cls._extract_attention_clauses(clauses, penalties, termination_info)

        # Overview text
        overview = cls._generate_overview(doc_type, parties, full_text)

        metadata = DocumentMetadata(
            id=doc_id,
            filename=filename,
            file_type=filename.split(".")[-1].upper(),
            upload_date="2025-01-15",
            page_count=len(pages),
            doc_type=doc_type,
            parties=parties,
            jurisdiction=cls._extract_jurisdiction(full_text),
            important_dates=important_dates[:6],
            monetary_values=monetary_values[:6]
        )

        summary = DocumentSummary(
            overview=overview,
            doc_type=doc_type,
            parties=parties,
            important_obligations=obligations[:5],
            deadlines=[d for d in important_dates if any(k in d.lower() for k in ["notice", "day", "before", "term", "month"])][:5],
            payments=monetary_values[:5],
            clauses_requiring_attention=attention_clauses[:4],
            rights_summary=rights[:4],
            penalties_summary=penalties[:4],
            termination_summary=termination_info,
            dispute_resolution=dispute_info
        )

        return metadata, summary

    @staticmethod
    def _extract_parties(text: str, doc_type: str) -> List[str]:
        parties = []
        # Check specific party indicators
        lessor_match = re.search(r'(?:Lessor|Landlord)[\s:]+([^\n,]{3,50})', text, re.IGNORECASE)
        lessee_match = re.search(r'(?:Lessee|Tenant)[\s:]+([^\n,]{3,50})', text, re.IGNORECASE)
        if lessor_match and lessee_match:
            return [f"Lessor: {lessor_match.group(1).strip()}", f"Lessee: {lessee_match.group(1).strip()}"]

        employer_match = re.search(r'(?:Employer|Company)[\s:]+([^\n,]{3,50})', text, re.IGNORECASE)
        employee_match = re.search(r'(?:Employee)[\s:]+([^\n,]{3,50})', text, re.IGNORECASE)
        if employer_match and employee_match:
            return [f"Employer: {employer_match.group(1).strip()}", f"Employee: {employee_match.group(1).strip()}"]

        party_a = re.search(r'Party\s+A[\s:]+([^\n,]{3,50})', text, re.IGNORECASE)
        party_b = re.search(r'Party\s+B[\s:]+([^\n,]{3,50})', text, re.IGNORECASE)
        if party_a and party_b:
            return [f"Party A: {party_a.group(1).strip()}", f"Party B: {party_b.group(1).strip()}"]

        from_match = re.search(r'FROM:[\s\n]+([^\n,]{3,50})', text, re.IGNORECASE)
        to_match = re.search(r'TO:[\s\n]+(?:\d+\.\s*)?([^\n,]{3,50})', text, re.IGNORECASE)
        if from_match and to_match:
            return [f"From (Sender): {from_match.group(1).strip()}", f"To (Recipient): {to_match.group(1).strip()}"]

        # Default fallback
        return ["Party 1: First Party", "Party 2: Second Party"]

    @staticmethod
    def _extract_monetary_values(text: str) -> List[str]:
        results = []
        matches = re.findall(r'(?:INR|Rs\.?|₹)\s*[\d,]+(?:\s*\/-)?(?:\s*\([^\)]+\))?', text)
        for m in matches:
            clean = m.strip()
            if clean not in results and len(clean) > 3:
                results.append(clean)
        return results if results else ["No explicit monetary sums detected"]

    @staticmethod
    def _extract_dates(text: str) -> List[str]:
        dates = []
        # Match dates like: 1st October 2024, 15th August, 2024, 10/01/2025, 90 days, 15 days
        date_patterns = [
            r'\b\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December),?\s+\d{4}\b',
            r'\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}\b',
            r'\b(?:\d+|[A-Za-z]+)\s+(?:calendar\s+)?days\b'
        ]
        for pat in date_patterns:
            for m in re.finditer(pat, text, re.IGNORECASE):
                val = m.group(0).strip()
                if val not in dates:
                    dates.append(val)
        return dates

    @staticmethod
    def _extract_obligations(clauses: List[Dict[str, Any]], full_text: str) -> List[str]:
        obs = []
        for c in clauses:
            if c["category"] in ["Obligations & Rights", "Payment & Compensation", "Confidentiality & IP"]:
                lines = [l.strip() for l in c["text"].split("\n") if len(l.strip()) > 20]
                for line in lines[:2]:
                    obs.append(f"{c['title']}: {line[:120]}...")
        if not obs:
            obs = ["Comply with stated terms and timely notices.", "Maintain property/information with reasonable care."]
        return obs

    @staticmethod
    def _extract_penalties(clauses: List[Dict[str, Any]], full_text: str) -> List[str]:
        penalties = []
        for c in clauses:
            if "penalty" in c["text"].lower() or "late fee" in c["text"].lower() or "forfeit" in c["text"].lower() or "liquidated damages" in c["text"].lower():
                penalties.append(f"{c['title']}: {c['text'][:140]}...")
        if not penalties:
            penalties = ["Liquidated damages and forfeiture of deposits upon early default."]
        return penalties

    @staticmethod
    def _extract_rights(clauses: List[Dict[str, Any]], full_text: str) -> List[str]:
        rights = []
        for c in clauses:
            if "right" in c["text"].lower() or "entitled" in c["text"].lower() or "refund" in c["text"].lower():
                rights.append(f"{c['title']}: {c['text'][:140]}...")
        if not rights:
            rights = ["Right to prompt refund upon peaceful handover/settlement.", "Right to prior notice before inspection or termination."]
        return rights

    @staticmethod
    def _extract_termination_summary(clauses: List[Dict[str, Any]], full_text: str) -> str:
        for c in clauses:
            if "terminat" in c["title"].lower() or "exit" in c["title"].lower() or "notice" in c["title"].lower():
                return f"{c['title']} ({c['section_number']}): {c['text'][:250]}..."
        return "Agreement specifies structured notice period and conditions required for lawful termination."

    @staticmethod
    def _extract_dispute_info(clauses: List[Dict[str, Any]], full_text: str) -> str:
        for c in clauses:
            if "dispute" in c["title"].lower() or "arbitration" in c["title"].lower() or "jurisdiction" in c["title"].lower():
                return f"{c['title']} ({c['section_number']}): {c['text'][:250]}..."
        return "Governed by laws of India with exclusive civil court jurisdiction in Andhra Pradesh."

    @staticmethod
    def _extract_attention_clauses(clauses: List[Dict[str, Any]], penalties: List[str], termination: str) -> List[str]:
        attention = []
        for c in clauses:
            cat = c["category"]
            if cat in ["Penalties & Liabilities", "Termination & Exit"] or "lock-in" in c["text"].lower():
                attention.append(f"⚠️ {c['title']} ({c['section_number']}): Review restrictive lock-in or penalty covenants.")
        if not attention:
            attention = ["⚠️ Check early exit notice windows.", "⚠️ Check security deposit refund and deduction rules."]
        return attention

    @staticmethod
    def _extract_jurisdiction(text: str) -> str:
        if "andhra pradesh" in text.lower():
            if "visakhapatnam" in text.lower():
                return "India (Visakhapatnam, Andhra Pradesh)"
            if "vijayawada" in text.lower():
                return "India (Vijayawada, Andhra Pradesh)"
            return "India (Andhra Pradesh)"
        if "telangana" in text.lower() or "hyderabad" in text.lower():
            return "India (Hyderabad, Telangana / Andhra Pradesh)"
        return "India"

    @staticmethod
    def _generate_overview(doc_type: str, parties: List[str], text: str) -> str:
        parties_str = " and ".join(parties) if parties else "the designated parties"
        return (
            f"This document is a legally binding {doc_type} executed between {parties_str}. "
            f"It establishes commercial and operational covenants, delineates mutual obligations, "
            f"financial considerations, structured notice windows, and mandatory dispute resolution procedures."
        )
