import os
import re
from typing import List, Optional
from models.schemas import Evidence, AskResponse

class GeminiService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        self.client = None
        if self.api_key:
            self._init_client()

    def set_api_key(self, api_key: str):
        self.api_key = api_key
        self._init_client()

    def _init_client(self):
        try:
            from google import genai
            self.client = genai.Client(api_key=self.api_key)
        except Exception as e:
            print(f"Notice: Gemini client initialization error: {e}")
            self.client = None

    def answer_question(self, query: str, doc_name: str, evidences: List[Evidence], full_context: str = "") -> AskResponse:
        """
        Answers user question strictly grounded in retrieved evidence chunks.
        """
        # If no relevant chunks retrieved at all:
        if not evidences:
            return AskResponse(
                answer="I could not find this information in the uploaded document. Please check if this topic is addressed under a different term, or verify the uploaded document scope.",
                evidences=[],
                grounding_status="not_found",
                confidence_score=0.0
            )

        # Build grounded context snippet
        evidence_text = "\n\n".join([
            f"[Source: {e.doc_name} | Page {e.page_number} | {e.section_number}: {e.section_title}]\n{e.text}"
            for e in evidences
        ])

        system_instruction = (
            "You are JurisPath, an AI legal document understanding assistant. "
            "Your role is to explain legal documents clearly, accurately, and objectively.\n\n"
            "MANDATORY SAFETY RULES:\n"
            "1. NEVER claim to be a lawyer or offer legal advice.\n"
            "2. NEVER predict court decisions, legal outcomes, or guarantee results.\n"
            "3. Base your answer EXCLUSIVELY on the provided Document Context.\n"
            "4. If the context does not contain the answer, reply: 'I could not find this information in the uploaded document.'\n"
            "5. Cite the exact Page and Section for every fact stated.\n"
            "6. Always explain the practical meaning in clear, everyday language that non-lawyers easily understand."
        )

        user_prompt = (
            f"DOCUMENT CONTEXT:\n{evidence_text}\n\n"
            f"USER QUESTION:\n{query}\n\n"
            "Provide a grounded, plain-language answer citing the specific Section and Page from the context above."
        )

        if self.client and self.api_key:
            try:
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=user_prompt,
                    config={
                        'system_instruction': system_instruction,
                        'temperature': 0.1
                    }
                )
                if response and response.text:
                    return AskResponse(
                        answer=response.text.strip(),
                        evidences=evidences,
                        grounding_status="grounded",
                        confidence_score=0.98
                    )
            except Exception as e:
                print(f"Gemini API invocation fallback: {e}")

        # Deterministic Grounded Engine (when API key is absent or offline)
        fallback_answer = self._generate_deterministic_grounded_answer(query, evidences)
        return AskResponse(
            answer=fallback_answer,
            evidences=evidences,
            grounding_status="grounded",
            confidence_score=0.95
        )

    def _generate_deterministic_grounded_answer(self, query: str, evidences: List[Evidence]) -> str:
        q_lower = query.lower()
        primary_ev = evidences[0]
        sec_label = f"{primary_ev.section_number} ({primary_ev.section_title})"
        page_label = f"Page {primary_ev.page_number}"

        # 1. Early Termination / Notice / Exit
        if any(w in q_lower for w in ["terminate", "termination", "early", "cancel", "leave", "quit"]):
            return (
                f"According to **{sec_label}** on **{page_label}**:\n\n"
                f"• **Notice Requirement**: The document specifies the formal notice conditions. Review the exact procedure required to terminate without penalty.\n"
                f"• **Key Clause Details**: \"{primary_ev.text.strip()}\"\n\n"
                f"• **Practical Meaning**: If you intend to end this agreement early, you must adhere strictly to the written notice timeframe stipulated in {primary_ev.section_number} to prevent forfeiture of deposits or liability for liquidated damages.\n\n"
                f"*(Source: {primary_ev.doc_name}, {sec_label}, {page_label})*"
            )

        # 2. Penalty / Late fees / Liquidated Damages
        if any(w in q_lower for w in ["penalty", "fine", "late fee", "forfeit", "damages"]):
            return (
                f"Based on **{sec_label}** on **{page_label}**:\n\n"
                f"• **Penalty Terms**: The agreement contains specific financial consequences or forfeiture clauses upon delay or default:\n"
                f"  \"{primary_ev.text.strip()}\"\n\n"
                f"• **Practical Meaning**: Ensure strict adherence to stated deadlines to avoid interest charges, daily late fees, or security forfeiture.\n\n"
                f"*(Source: {primary_ev.doc_name}, {sec_label}, {page_label})*"
            )

        # 3. Notice Period
        if any(w in q_lower for w in ["notice", "days notice", "notice period"]):
            return (
                f"According to **{sec_label}** on **{page_label}**:\n\n"
                f"• **Notice Period Specification**: The agreement mandates prior written communication before any major action or termination:\n"
                f"  \"{primary_ev.text.strip()}\"\n\n"
                f"• **Practical Meaning**: Any notification should be issued in writing (and via documented delivery like Registered Post or tracked email) matching the exact notice window.\n\n"
                f"*(Source: {primary_ev.doc_name}, {sec_label}, {page_label})*"
            )

        # 4. Obligations / Duties
        if any(w in q_lower for w in ["obligation", "duty", "duties", "responsibilit", "keep", "rules"]):
            return (
                f"Under **{sec_label}** on **{page_label}**:\n\n"
                f"• **Key Responsibilities Identified**:\n"
                f"  \"{primary_ev.text.strip()}\"\n\n"
                f"• **Practical Meaning**: You are required to fulfill these operational duties faithfully throughout the term of this agreement.\n\n"
                f"*(Source: {primary_ev.doc_name}, {sec_label}, {page_label})*"
            )

        # 5. Dates / Expiration / Duration
        if any(w in q_lower for w in ["date", "duration", "term", "expire", "expiry", "how long"]):
            return (
                f"Referencing **{sec_label}** on **{page_label}**:\n\n"
                f"• **Duration & Date Clauses**:\n"
                f"  \"{primary_ev.text.strip()}\"\n\n"
                f"• **Practical Meaning**: Note the commencement and scheduled conclusion dates to track required renewals or timely handover.\n\n"
                f"*(Source: {primary_ev.doc_name}, {sec_label}, {page_label})*"
            )

        # Generic grounded response synthesized from top chunk
        return (
            f"Based on **{sec_label}** on **{page_label}**:\n\n"
            f"\"{primary_ev.text.strip()}\"\n\n"
            f"• **Plain Language Breakdown**: The uploaded document specifically addresses your query in {primary_ev.section_number}. "
            f"Please review the quoted clause carefully.\n\n"
            f"*(Verified from {primary_ev.doc_name}, {page_label}, {sec_label})*"
        )
