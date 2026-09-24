import os
import re
from typing import List, Dict, Any, Tuple
import pypdf
import docx

class ParserService:
    @staticmethod
    def parse_txt(file_bytes: bytes, filename: str) -> Tuple[str, List[str]]:
        """Parses TXT files into full text and pages (simulated 400-word pages)."""
        try:
            full_text = file_bytes.decode('utf-8')
        except UnicodeDecodeError:
            full_text = file_bytes.decode('latin-1', errors='replace')
        
        # Split into pages by explicit formfeed or approximate by character/paragraph blocks
        if "\x0c" in full_text:
            raw_pages = full_text.split("\x0c")
            pages = [p.strip() for p in raw_pages if p.strip()]
        else:
            # Split roughly into ~2500 character / ~400 word chunks as pages
            paragraphs = full_text.split("\n\n")
            pages = []
            curr_page = []
            curr_len = 0
            for p in paragraphs:
                curr_page.append(p)
                curr_len += len(p)
                if curr_len >= 2000:
                    pages.append("\n\n".join(curr_page).strip())
                    curr_page = []
                    curr_len = 0
            if curr_page:
                pages.append("\n\n".join(curr_page).strip())
        
        if not pages:
            pages = [full_text]
        return full_text, pages

    @staticmethod
    def parse_pdf(file_bytes: bytes) -> Tuple[str, List[str]]:
        """Parses PDF bytes into full text and page-by-page text."""
        import io
        pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        pages = []
        for i, page in enumerate(pdf_reader.pages):
            text = page.extract_text() or ""
            pages.append(text.strip())
        full_text = "\n\n--- PAGE BREAK ---\n\n".join(pages)
        return full_text, pages

    @staticmethod
    def parse_docx(file_bytes: bytes) -> Tuple[str, List[str]]:
        """Parses DOCX bytes into full text and simulated page paragraphs."""
        import io
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        full_text = "\n\n".join(paragraphs)
        
        # Paginate
        pages = []
        curr_page = []
        curr_len = 0
        for p in paragraphs:
            curr_page.append(p)
            curr_len += len(p)
            if curr_len >= 2200:
                pages.append("\n\n".join(curr_page).strip())
                curr_page = []
                curr_len = 0
        if curr_page:
            pages.append("\n\n".join(curr_page).strip())
        if not pages:
            pages = [full_text]
        return full_text, pages

    @classmethod
    def parse_document(cls, file_bytes: bytes, filename: str) -> Tuple[str, List[str], str]:
        """Auto-detect format and parse to full text and pages."""
        ext = os.path.splitext(filename)[1].lower()
        if ext == ".pdf":
            full_text, pages = cls.parse_pdf(file_bytes)
            file_type = "PDF"
        elif ext in [".docx", ".doc"]:
            full_text, pages = cls.parse_docx(file_bytes)
            file_type = "DOCX"
        else:
            full_text, pages = cls.parse_txt(file_bytes, filename)
            file_type = "TXT"
        return full_text, pages, file_type

    @classmethod
    def extract_clauses(cls, full_text: str, pages: List[str]) -> List[Dict[str, Any]]:
        """
        Extracts numbered sections and clauses with section number, title, text, and page number.
        """
        clauses = []
        # Match patterns like: "1. DURATION AND TENURE", "Clause 2: Rent", "Section 3 - Deposit"
        pattern = re.compile(
            r'(?:^|\n)(?:(\d+)\.|\bClause\s+(\d+)[:.]?|\bSection\s+(\d+)[:.]?)\s*([A-Z0-9\s,\-–\(\)]{3,50})(?:\n|:)([\s\S]*?)(?=(?:\n(?:(?:\d+)\.|\bClause|\bSection)|$))',
            re.MULTILINE
        )
        
        matches = list(pattern.finditer(full_text))
        
        if matches:
            for idx, match in enumerate(matches):
                sec_num = match.group(1) or match.group(2) or match.group(3) or str(idx + 1)
                sec_title = match.group(4).strip().title()
                sec_body = match.group(5).strip()
                
                # Determine page number
                found_page = 1
                for p_idx, page_content in enumerate(pages):
                    if sec_title[:20].lower() in page_content.lower() or sec_body[:40].lower() in page_content.lower():
                        found_page = p_idx + 1
                        break
                
                clauses.append({
                    "id": f"clause_{idx+1}",
                    "section_number": f"Section {sec_num}",
                    "title": sec_title,
                    "text": sec_body,
                    "page_number": found_page,
                    "category": cls._categorize_clause(sec_title, sec_body)
                })
        else:
            # Fallback if unnumbered: split by paragraph blocks
            paragraphs = [p.strip() for p in full_text.split("\n\n") if len(p.strip()) > 80]
            for idx, p in enumerate(paragraphs[:15]):
                lines = p.split("\n")
                first_line = lines[0].strip()
                title = first_line[:40] if len(first_line) > 5 else f"Clause {idx+1}"
                body = "\n".join(lines[1:]) if len(lines) > 1 else p
                clauses.append({
                    "id": f"clause_{idx+1}",
                    "section_number": f"Clause {idx+1}",
                    "title": title.title(),
                    "text": body,
                    "page_number": 1 + (idx // 4),
                    "category": cls._categorize_clause(title, body)
                })
                
        return clauses

    @staticmethod
    def _categorize_clause(title: str, text: str) -> str:
        combined = (title + " " + text).lower()
        if any(w in combined for w in ["rent", "payment", "salary", "compensation", "fee", "consideration"]):
            return "Payment & Compensation"
        if any(w in combined for w in ["deposit", "security", "advance"]):
            return "Deposit & Security"
        if any(w in combined for w in ["terminate", "termination", "cancellation", "lock-in"]):
            return "Termination & Exit"
        if any(w in combined for w in ["notice", "days notice", "prior notice"]):
            return "Notice Periods"
        if any(w in combined for w in ["confidential", "proprietary", "trade secret", "nda"]):
            return "Confidentiality & IP"
        if any(w in combined for w in ["dispute", "arbitration", "jurisdiction", "court", "governing law"]):
            return "Dispute Resolution"
        if any(w in combined for w in ["penalty", "late fee", "damages", "forfeit"]):
            return "Penalties & Liabilities"
        if any(w in combined for w in ["repair", "maintenance", "duties", "obligations", "restriction"]):
            return "Obligations & Rights"
        return "General"
