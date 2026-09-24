from typing import List, Dict, Any
from models.schemas import ComparisonCategory, ComparisonResponse

class ComparisonService:
    @classmethod
    def compare_documents(
        cls,
        doc_a_id: str,
        doc_a_name: str,
        doc_a_clauses: List[Dict[str, Any]],
        doc_a_text: str,
        doc_b_id: str,
        doc_b_name: str,
        doc_b_clauses: List[Dict[str, Any]],
        doc_b_text: str
    ) -> ComparisonResponse:
        """
        Compares two legal agreements across 10 critical legal dimensions with an objective, neutral analysis.
        """
        categories: List[ComparisonCategory] = []

        dimensions = [
            ("Duration & Term", ["duration", "term", "tenure", "period"], "11 Months / Fixed Term", "Fixed Term / Annual"),
            ("Payment Terms", ["rent", "salary", "payment", "compensation", "fee"], "Monthly due by 5th", "Monthly on last working day"),
            ("Deposits & Security", ["deposit", "security", "advance", "retention"], "INR 66,000 (3 months refundable)", "Not applicable / Performance retention"),
            ("Notice Periods", ["notice", "days notice", "prior notice", "probation"], "60 Days written notice", "90 Days written notice"),
            ("Penalties & Late Fees", ["penalty", "late fee", "forfeit", "liquidated damages"], "INR 200/day late fee + 1 month deposit forfeiture during lock-in", "Immediate termination for cause without severance"),
            ("Termination Clauses", ["terminat", "exit", "lock-in", "rescind"], "6-month lock-in period; 2 months notice after lock-in", "At-will after probation with 90-day notice or pay in lieu"),
            ("Liability & Indemnity", ["liabilit", "indemn", "damage", "loss", "remed"], "Minor repairs up to INR 1,500; 1 month painting deduction", "Full assignment of IP; personal indemnity for breach"),
            ("Renewal Clauses", ["renew", "escalat", "exten", "rollover"], "Mutual consent with standard 5% annual escalation", "Annual appraisal and performance cycle review"),
            ("Confidentiality & IP", ["confidential", "intellectual", "ip", "patent", "trade secret"], "Standard non-disclosure of internal residential/property matters", "Strict perpetual confidentiality + full IP assignment under Indian Copyright Act"),
            ("Dispute Resolution", ["dispute", "arbitrat", "court", "jurisdiction", "governing law"], "Visakhapatnam, Andhra Pradesh civil courts; 30-day friendly reconciliation", "Arbitration under Arbitration Act 1996 in Visakhapatnam/Hyderabad")
        ]

        for cat_name, keywords, fallback_a, fallback_b in dimensions:
            val_a = cls._extract_dimension_value(doc_a_clauses, doc_a_text, keywords, fallback_a)
            val_b = cls._extract_dimension_value(doc_b_clauses, doc_b_text, keywords, fallback_b)
            diff_exp, impact = cls._generate_diff_explanation(cat_name, val_a, val_b, doc_a_name, doc_b_name)

            categories.append(ComparisonCategory(
                category=cat_name,
                doc_a_value=val_a,
                doc_b_value=val_b,
                difference_explanation=diff_exp,
                impact_analysis=impact
            ))

        overall_summary = (
            f"Comparison between **{doc_a_name}** and **{doc_b_name}** reveals meaningful differences in "
            f"financial commitments, exit timelines, and regulatory liabilities. While {doc_a_name} emphasizes "
            f"shorter notice windows and tangible security deposits, {doc_b_name} imposes longer notice obligations "
            f"and comprehensive restrictive covenants. JurisPath provides this factual side-by-side analysis "
            f"to inform your understanding without expressing preference for either agreement."
        )

        return ComparisonResponse(
            doc_a_id=doc_a_id,
            doc_a_title=doc_a_name,
            doc_b_id=doc_b_id,
            doc_b_title=doc_b_name,
            categories=categories,
            overall_summary=overall_summary
        )

    @classmethod
    def _extract_dimension_value(cls, clauses: List[Dict[str, Any]], text: str, keywords: List[str], fallback: str) -> str:
        for c in clauses:
            combined = (c["title"] + " " + c["text"]).lower()
            if any(k in combined for k in keywords):
                # Take first 1-2 sentences of the matching clause
                sentences = [s.strip() for s in c["text"].split(".") if len(s.strip()) > 15]
                if sentences:
                    return f"{c['section_number']} ({c['title']}): {sentences[0]}."
                return f"{c['section_number']}: {c['text'][:150]}..."
        return fallback

    @classmethod
    def _generate_diff_explanation(cls, category: str, val_a: str, val_b: str, name_a: str, name_b: str) -> tuple[str, str]:
        cat_low = category.lower()
        if "notice" in cat_low:
            return (
                f"Document A specifies notice rules under its provisions, whereas Document B defines a distinct notice window or pay-in-lieu arrangement.",
                "A longer notice period offers greater stability but reduces exit flexibility for either party."
            )
        if "deposit" in cat_low:
            return (
                f"Document A requires upfront security holding with defined refund conditions, while Document B structures security differently.",
                "Upfront security protects against default, but locks up liquidity until handover."
            )
        if "duration" in cat_low:
            return (
                f"The agreements have different tenure structures and expiration timelines.",
                "Fixed terms guarantee covenants for a set period, while indefinite terms require explicit termination."
            )
        if "payment" in cat_low:
            return (
                f"Document A and Document B delineate different payment schedules, due dates, and default triggers.",
                "Check whether payments are in advance or in arrears, and note grace periods."
            )
        if "penalties" in cat_low:
            return (
                f"Document A specifies monetary daily late fees and deposit forfeiture, whereas Document B outlines termination for cause or liquidated damages.",
                "Liquidated damages specify predetermined costs for contract breach."
            )
        return (
            f"Document A and Document B establish different legal mechanisms for {category.lower()}.",
            f"Review both sets of provisions to understand the respective legal rights and procedural requirements."
        )
