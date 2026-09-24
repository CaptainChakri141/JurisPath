import unittest
import os
import sys
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from main import app
from cache import LRUTTLCache, app_cache


class TestEfficiency(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_lru_ttl_cache_logic(self):
        cache = LRUTTLCache(max_size=2, default_ttl_seconds=10)
        cache.set("test", "val1", "arg1")
        cache.set("test", "val2", "arg2")

        self.assertEqual(cache.get("test", "arg1"), "val1")
        self.assertEqual(cache.get("test", "arg2"), "val2")

        # Adding 3rd item should evict LRU item (which was "arg1" before it was read, but "arg1" was read so "arg2" is least recently used!)
        cache.set("test", "val3", "arg3")
        self.assertEqual(cache.get("test", "arg3"), "val3")
        # Check stats
        stats = cache.get_stats()
        self.assertGreater(stats["hits"], 0)

    def test_repeated_ask_is_cached(self):
        # Clear cache first
        self.client.post("/api/cache/clear")

        query_payload = {"query": "What is the security deposit amount?"}

        # First request (cache miss)
        t0 = time.perf_counter()
        resp1 = self.client.post("/api/documents/sample_rental_1/ask", json=query_payload)
        t1 = time.perf_counter()
        dur1 = t1 - t0
        self.assertEqual(resp1.status_code, 200)

        # Second request with identical question (cache hit)
        t2 = time.perf_counter()
        resp2 = self.client.post("/api/documents/sample_rental_1/ask", json=query_payload)
        t3 = time.perf_counter()
        dur2 = t3 - t2
        self.assertEqual(resp2.status_code, 200)

        # Responses must match exactly
        self.assertEqual(resp1.json()["answer"], resp2.json()["answer"])

        # Cached request should be much faster (usually < 15ms vs full RAG)
        self.assertLess(dur2, 0.1)

        # Verify cache stats show hits
        stats = self.client.get("/api/cache/stats").json()
        self.assertGreaterEqual(stats["hits"], 1)

    def test_repeated_comparison_is_cached(self):
        comp_payload = {
            "doc_a_id": "sample_rental_1",
            "doc_b_id": "sample_nda_1"
        }
        # First call
        resp1 = self.client.post("/api/documents/compare", json=comp_payload)
        self.assertEqual(resp1.status_code, 200)

        # Second call
        resp2 = self.client.post("/api/documents/compare", json=comp_payload)
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp1.json()["overall_summary"], resp2.json()["overall_summary"])


if __name__ == "__main__":
    unittest.main()
