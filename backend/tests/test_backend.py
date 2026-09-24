import unittest
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.parser_service import ParserService
from services.rag_service import RAGService
from services.analyzer_service import AnalyzerService
from services.gemini_service import GeminiService
from services.simple_language_service import SimpleLanguageService
from services.comparison_service import ComparisonService
from services.deadline_service import DeadlineService
from services.navigator_service import NavigatorService

class TestJurisPathBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sample_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sample_docs", "Sample_Residential_Rental_Agreement.txt"))
        with open(cls.sample_path, "r", encoding="utf-8") as f:
            cls.raw_text = f.read()
        cls.file_bytes = cls.raw_text.encode("utf-8")
        cls.full_text, cls.pages, _ = ParserService.parse_document(cls.file_bytes, "Sample_Residential_Rental_Agreement.txt")
        cls.clauses = ParserService.extract_clauses(cls.full_text, cls.pages)
        cls.metadata, cls.summary = AnalyzerService.analyze_document(
            "test_doc_1", "Sample_Residential_Rental_Agreement.txt", cls.full_text, cls.pages, cls.clauses
        )
        cls.rag = RAGService()
        cls.rag.index_document("test_doc_1", "Sample_Residential_Rental_Agreement.txt", cls.clauses, cls.pages)

    def test_parser_and_clauses(self):
        self.assertGreater(len(self.clauses), 4)
        has_termination = any("termination" in c["title"].lower() or "lock-in" in c["title"].lower() for c in self.clauses)
        self.assertTrue(has_termination)

    def test_analyzer_summary(self):
        self.assertEqual(self.metadata.doc_type, "Residential Tenancy Agreement")
        self.assertIn("Lessor", self.metadata.parties[0])
        self.assertIn("INR 22,000", " ".join(self.metadata.monetary_values))
        self.assertGreater(len(self.summary.important_obligations), 0)

    def test_rag_retrieval_and_evidence(self):
        evidences = self.rag.retrieve("test_doc_1", "Can I terminate this agreement early?", top_k=2)
        self.assertGreater(len(evidences), 0)
        top_ev = evidences[0]
        self.assertTrue(top_ev.page_number >= 1)
        self.assertIsNotNone(top_ev.section_number)
        self.assertIn("Sample_Residential_Rental_Agreement.txt", top_ev.doc_name)

    def test_gemini_grounded_answer(self):
        gemini = GeminiService()
        evidences = self.rag.retrieve("test_doc_1", "Can I terminate early?", top_k=2)
        resp = gemini.answer_question("Can I terminate early?", "Sample_Residential_Rental_Agreement.txt", evidences)
        self.assertEqual(resp.grounding_status, "grounded")
        self.assertGreater(len(resp.evidences), 0)
        self.assertIn("Notice", resp.answer)

    def test_simple_language_mode(self):
        simple_clauses = SimpleLanguageService.translate_clauses(self.clauses)
        self.assertGreater(len(simple_clauses), 0)
        first = simple_clauses[0]
        self.assertTrue(len(first.plain_language) > 10)
        self.assertTrue(len(first.practical_meaning) > 10)
        self.assertGreater(len(first.things_to_check), 0)

    def test_deadline_detection(self):
        deadlines = DeadlineService.extract_deadlines(self.clauses, self.full_text)
        self.assertGreater(len(deadlines), 0)
        has_notice_or_pay = any(d.category in ["Notice Period", "Payment", "Expiration"] for d in deadlines)
        self.assertTrue(has_notice_or_pay)

    def test_comparison_service(self):
        comp = ComparisonService.compare_documents(
            "doc_1", "Lease A", self.clauses, self.full_text,
            "doc_2", "Lease B", self.clauses, self.full_text
        )
        self.assertEqual(len(comp.categories), 10)
        self.assertIn("Comparison between", comp.overall_summary)

    def test_navigator_guidance(self):
        guidance = NavigatorService.generate_guidance(
            "legal_notice", "India", "Andhra Pradesh",
            {"notice_type": "Cheque Bounce (Section 138 NI Act)", "deadline_days": "15 Days"}
        )
        self.assertEqual(guidance.scenario_id, "legal_notice")
        self.assertGreater(len(guidance.relevant_statutes), 0)
        self.assertGreater(len(guidance.documents_to_gather), 0)
        self.assertGreater(len(guidance.possible_next_steps), 0)

if __name__ == "__main__":
    unittest.main()
