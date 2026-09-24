from typing import List, Dict, Any
from models.schemas import SimpleLanguageClause

class SimpleLanguageService:
    @classmethod
    def translate_clauses(cls, clauses: List[Dict[str, Any]]) -> List[SimpleLanguageClause]:
        translated = []
        for c in clauses:
            title = c["title"]
            text = c["text"]
            cat = c["category"]
            page = c["page_number"]
            sec_num = c["section_number"]

            plain, practical, checks = cls._simplify_clause(title, text, cat)
            translated.append(SimpleLanguageClause(
                section_number=sec_num,
                title=title,
                original_text=text[:500],
                plain_language=plain,
                practical_meaning=practical,
                things_to_check=checks,
                page_number=page
            ))
        return translated

    @staticmethod
    def _simplify_clause(title: str, text: str, cat: str) -> tuple[str, str, List[str]]:
        t_low = title.lower()
        c_low = text.lower()

        if "duration" in t_low or "tenure" in t_low or "term" in t_low:
            plain = "This section specifies how long this legal agreement lasts and under what terms it can be renewed."
            practical = "Make note of the start and end dates. If you wish to continue after this term, you must agree in writing and expect any stated percentage rent or fee escalation."
            checks = [
                "Verify the exact start date and expiry date.",
                "Check if renewal is automatic or requires explicit mutual consent.",
                "Look for any rent or price escalation clauses (e.g. 5% or 10%)."
            ]
        elif "rent" in t_low or "payment" in t_low or "salary" in t_low or "compensation" in t_low:
            plain = "This clause defines exactly how much money is owed, the deadline for payment each month, and the penalty for delays."
            practical = "Pay the stated amount by the agreed due date (e.g. by the 5th of each month) to avoid late fee penalties or contract breach."
            checks = [
                "Check the exact cut-off day (e.g., 5th or 10th of the month).",
                "Review daily late fee penalties (e.g. INR 200/day).",
                "Ensure bank transfers or receipts are documented in writing."
            ]
        elif "deposit" in t_low or "security" in t_low:
            plain = "This clause explains how much advance security deposit you pay, whether it earns interest, and how quickly it must be refunded when you leave."
            practical = "Your deposit protects the other party against damages or unpaid dues. When you leave, they must return it within the stated days (e.g. 7 business days) minus lawful deductions."
            checks = [
                "Confirm the exact timeline for deposit return (e.g. within 7 to 14 days).",
                "Note permitted deductions: unpaid utility bills, physical damages, repainting.",
                "Take photos of premises or assets at move-in to prevent unfair deductions."
            ]
        elif "lock-in" in c_low or "termination" in t_low or "notice" in t_low:
            plain = "This clause outlines the rules for ending the agreement early, including any lock-in period and mandatory notice days."
            practical = "During a lock-in period, you cannot terminate without penalty (such as forfeiting one month's deposit). After the lock-in, you must give written notice matching the required days (e.g. 30, 60, or 90 days)."
            checks = [
                "Is there a lock-in period where early exit is penalized?",
                "How many days written notice is required (e.g. 30, 60, or 90 days)?",
                "Can you pay salary or rent in lieu of notice if you need an immediate exit?"
            ]
        elif "confidential" in t_low or "nda" in t_low or "proprietary" in t_low:
            plain = "This clause forbids sharing sensitive or private business information with unauthorized outsiders."
            practical = "Keep all non-public technical data, client lists, and internal processes secret. This duty typically lasts for years even after the contract ends."
            checks = [
                "Review how many years confidentiality survives after contract expiry.",
                "Check exceptions (e.g., info that was already public or compelled by court).",
                "Confirm if you must return or destroy confidential files upon request."
            ]
        elif "dispute" in t_low or "governing law" in t_low or "arbitration" in t_low:
            plain = "This clause determines which state's laws govern the agreement and where lawsuits or arbitration must take place."
            practical = "If an argument cannot be solved amicably, legal claims must be filed in the specific courts named here (e.g., Visakhapatnam or Vijayawada, Andhra Pradesh)."
            checks = [
                "Check the designated city/court jurisdiction.",
                "Note whether arbitration is mandatory before going to court.",
                "Check if informal 30-day friendly reconciliation is required first."
            ]
        elif "repair" in t_low or "maintenance" in t_low:
            plain = "This clause splits the responsibility for day-to-day repairs, society maintenance, and repainting."
            practical = "You are usually responsible for minor repairs up to a set rupee amount, while the owner must fix major structural or roof issues."
            checks = [
                "Check the monetary threshold for minor tenant repairs (e.g. up to INR 1,500).",
                "Check if a full month's rent will be deducted for painting when you vacate.",
                "Ensure society maintenance fees (RWA) are clearly accounted for."
            ]
        elif "non-solicitation" in t_low or "restrictive" in t_low:
            plain = "This section restricts hiring away colleagues or stealing clients after you leave."
            practical = "Under Indian law (Section 27 of the Contract Act), blanket bans on working for competitors are generally void, but stealing client lists or recruiting colleagues remains actionable."
            checks = [
                "Check the restriction period (e.g. 12 months).",
                "Understand that post-employment restraints cannot prevent lawful livelihood in India.",
                "Ensure proprietary code and trade secrets are not transferred."
            ]
        else:
            plain = f"This section sets out specific legal guidelines regarding {title.lower()}."
            practical = "Read this provision to ensure your everyday actions comply with the contractual commitments."
            checks = [
                "Check for specific deadlines or rupee figures.",
                "Review any restrictions on your personal or business freedoms.",
                "Ensure both parties have reciprocal rights."
            ]

        return plain, practical, checks
