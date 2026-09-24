import unittest
import os
import sys

# Ensure backend root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from main import app, documents_store


class TestAPIEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "online")
        self.assertGreaterEqual(data["loaded_documents"], 1)
        self.assertIn("cache_stats", data)
        self.assertIn("security", data)

    def test_02_list_documents(self):
        response = self.client.get("/api/documents")
        self.assertEqual(response.status_code, 200)
        docs = response.json()
        self.assertIsInstance(docs, list)
        self.assertGreater(len(docs), 0)
        self.assertTrue(any(d["id"] == "sample_rental_1" for d in docs))

    def test_03_get_document_detail(self):
        response = self.client.get("/api/documents/sample_rental_1")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("metadata", data)
        self.assertIn("summary", data)
        self.assertIn("clauses", data)
        self.assertGreater(len(data["clauses"]), 0)

    def test_04_get_document_not_found(self):
        response = self.client.get("/api/documents/non_existent_doc_id")
        self.assertEqual(response.status_code, 404)

    def test_05_ask_document_question(self):
        payload = {"query": "Can I terminate this lease early?"}
        response = self.client.post("/api/documents/sample_rental_1/ask", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("answer", data)
        self.assertIn("evidences", data)
        self.assertEqual(data["grounding_status"], "grounded")
        self.assertGreater(len(data["evidences"]), 0)

    def test_06_ask_document_not_found_query(self):
        # Query for something completely unrelated to legal contracts (e.g. quantum astrophysics formulas)
        payload = {"query": "What is the quantum electrodynamics wavelength of an electron in a black hole?"}
        response = self.client.post("/api/documents/sample_rental_1/ask", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("answer", data)
        # Should cleanly indicate not found or fall back gracefully
        self.assertIn("could not find", data["answer"].lower())

    def test_07_simple_language_clauses(self):
        response = self.client.get("/api/documents/sample_rental_1/simple-language")
        self.assertEqual(response.status_code, 200)
        clauses = response.json()
        self.assertIsInstance(clauses, list)
        self.assertGreater(len(clauses), 0)
        first = clauses[0]
        self.assertIn("plain_language", first)
        self.assertIn("practical_meaning", first)
        self.assertIn("things_to_check", first)

    def test_08_deadlines_detection(self):
        response = self.client.get("/api/documents/sample_rental_1/deadlines")
        self.assertEqual(response.status_code, 200)
        deadlines = response.json()
        self.assertIsInstance(deadlines, list)
        self.assertGreater(len(deadlines), 0)
        first = deadlines[0]
        self.assertIn("title", first)
        self.assertIn("category", first)
        self.assertIn("urgency", first)

    def test_09_compare_documents(self):
        payload = {
            "doc_a_id": "sample_rental_1",
            "doc_b_id": "sample_employment_1"
        }
        response = self.client.post("/api/documents/compare", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["categories"]), 10)
        self.assertIn("overall_summary", data)
        self.assertIn("disclaimer", data)

    def test_10_navigator_scenarios(self):
        response = self.client.get("/api/navigator/scenarios")
        self.assertEqual(response.status_code, 200)
        scenarios = response.json()
        self.assertGreaterEqual(len(scenarios), 7)
        scenario_ids = [s["id"] for s in scenarios]
        self.assertIn("legal_notice", scenario_ids)
        self.assertIn("rental_issue", scenario_ids)
        self.assertIn("employment_issue", scenario_ids)
        self.assertIn("government_rti", scenario_ids)

    def test_11_navigator_guidance(self):
        payload = {
            "scenario_id": "rental_tenancy",
            "jurisdiction_country": "India",
            "jurisdiction_state": "Andhra Pradesh",
            "answers": {
                "issue_type": "Security Deposit Withheld Without Explanation",
                "days_vacated": "More than 60 Days"
            }
        }
        response = self.client.post("/api/navigator/guidance", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["scenario_id"], "rental_tenancy")
        self.assertIn("Andhra Pradesh", data["jurisdiction"])
        self.assertGreater(len(data["relevant_statutes"]), 0)
        self.assertGreater(len(data["documents_to_gather"]), 0)
        self.assertGreater(len(data["possible_next_steps"]), 0)

    def test_12_demo_documents(self):
        response = self.client.get("/api/demo-documents")
        self.assertEqual(response.status_code, 200)
        demos = response.json()
        self.assertGreaterEqual(len(demos), 4)


if __name__ == "__main__":
    unittest.main()
