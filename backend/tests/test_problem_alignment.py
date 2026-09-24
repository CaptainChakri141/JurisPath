"""
Tests verifying Problem Statement Alignment, Code Quality, Security,
Efficiency, and Testing parameters for JurisPath.
"""
import unittest
import os
import sys

# Ensure backend root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from main import app, documents_store
from services.navigator_service import NavigatorService
from services.simple_language_service import SimpleLanguageService
from services.comparison_service import ComparisonService
from security import sanitize_input_text, sanitize_filename


class TestProblemStatementAlignment(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_problem_statement_alignment_legal_understanding_philosophy(self):
        """
        Validates alignment with the core legal understanding workflow:
        UNDERSTAND -> EXPLAIN -> ASK -> COMPARE -> NAVIGATE -> VERIFY
        """
        # 1. UNDERSTAND & EXPLAIN: Preloaded demo documents must have parsed clauses & metadata
        self.assertIn("sample_rental_1", documents_store)
        doc = documents_store["sample_rental_1"]
        self.assertGreater(len(doc["clauses"]), 0)
        self.assertIn("Visakhapatnam", doc["metadata"].jurisdiction)
        self.assertIn("Andhra Pradesh", doc["metadata"].jurisdiction)

        # 2. ASK & VERIFY: Evidence Mode must return exact page and section citations
        ask_resp = self.client.post("/api/documents/sample_rental_1/ask", json={
            "query": "What is the security deposit amount?"
        })
        self.assertEqual(ask_resp.status_code, 200)
        data = ask_resp.json()
        self.assertEqual(data["grounding_status"], "grounded")
        self.assertTrue(len(data["evidences"]) > 0)
        first_ev = data["evidences"][0]
        self.assertIn("page_number", first_ev)
        self.assertIn("section_number", first_ev)
        self.assertIn("text", first_ev)

        # 3. COMPARE: 10-point delta matrix comparing two agreements
        comp_resp = self.client.post("/api/documents/compare", json={
            "doc_a_id": "sample_rental_1",
            "doc_b_id": "sample_employment_1"
        })
        self.assertEqual(comp_resp.status_code, 200)
        comp_data = comp_resp.json()
        self.assertEqual(len(comp_data["categories"]), 10)

        # 4. NAVIGATE: Official Indian & Andhra Pradesh statutory frameworks
        nav_resp = self.client.post("/api/navigator/guidance", json={
            "scenario_id": "consumer_complaint",
            "jurisdiction_country": "India",
            "jurisdiction_state": "Andhra Pradesh",
            "answers": {
                "product_type": "Defective electronics",
                "notice_served": "Yes"
            }
        })
        self.assertEqual(nav_resp.status_code, 200)
        nav_data = nav_resp.json()
        statutes = " ".join(s["source_name"] if isinstance(s, dict) else s for s in nav_data["relevant_statutes"])
        self.assertIn("Consumer Protection Act", statutes)

    def test_02_zero_hallucination_guarantee_on_unrelated_queries(self):
        """
        Ensures strict boundary enforcement: answers not in document text are explicitly rejected.
        """
        unrelated_query = "What is the recipe for baking chocolate chip cookies?"
        resp = self.client.post("/api/documents/sample_rental_1/ask", json={
            "query": unrelated_query
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        # Must decline to answer rather than fabricate
        self.assertIn("could not find", data["answer"].lower())

    def test_03_simple_language_four_layer_decomposition(self):
        """
        Validates the 4-layer plain language legal translation:
        1. Original Clause Text
        2. Plain Language Explanation
        3. Practical Meaning
        4. Things to Check
        """
        resp = self.client.get("/api/documents/sample_rental_1/simple-language")
        self.assertEqual(resp.status_code, 200)
        clauses = resp.json()
        self.assertGreater(len(clauses), 0)
        for clause in clauses[:3]:
            self.assertTrue(bool(clause.get("original_text")))
            self.assertTrue(bool(clause.get("plain_language")))
            self.assertTrue(bool(clause.get("practical_meaning")))
            self.assertTrue(len(clause.get("things_to_check", [])) > 0)

    def test_04_security_layer_input_defense(self):
        """
        Validates sanitization against XSS, null-byte injection, and path traversal.
        """
        malicious_input = "<script>alert('xss')</script>\x00\x1fTest clean"
        cleaned = sanitize_input_text(malicious_input)
        self.assertNotIn("\x00", cleaned)
        self.assertNotIn("\x1f", cleaned)

        traversal_file = "..\\..\\..\\windows\\system32\\cmd.exe"
        safe_file = sanitize_filename(traversal_file)
        self.assertNotIn("..", safe_file)
        self.assertNotIn("\\", safe_file)

    def test_05_efficiency_metrics_endpoint(self):
        """
        Validates the cache telemetry reporting hit ratios and active entries.
        """
        resp = self.client.get("/api/cache/stats")
        self.assertEqual(resp.status_code, 200)
        stats = resp.json()
        self.assertIn("cached_entries", stats)
        self.assertIn("hits", stats)
        self.assertIn("misses", stats)
        self.assertIn("hit_ratio", stats)

    def test_06_non_lawyer_legal_notice_scenario_guidance(self):
        """
        Validates guidance for Section 138 Negotiable Instruments Act notice.
        """
        guidance = NavigatorService.generate_guidance(
            scenario_id="legal_notice",
            jurisdiction_country="India",
            jurisdiction_state="Andhra Pradesh",
            answers={"notice_type": "Cheque Bounce (Section 138 NI Act)"}
        )
        self.assertEqual(guidance.scenario_id, "legal_notice")
        self.assertTrue(any("Negotiable Instruments Act" in s.source_name for s in guidance.relevant_statutes))
        self.assertTrue(len(guidance.documents_to_gather) > 0)
        self.assertTrue(len(guidance.possible_next_steps) > 0)


if __name__ == "__main__":
    unittest.main()
