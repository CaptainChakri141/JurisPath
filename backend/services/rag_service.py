import math
import re
from typing import List, Dict, Any, Optional
from models.schemas import Evidence

class RAGService:
    def __init__(self):
        # In-memory document chunks index: doc_id -> list of chunk dicts
        self.doc_index: Dict[str, List[Dict[str, Any]]] = {}

    def index_document(self, doc_id: str, doc_name: str, clauses: List[Dict[str, Any]], pages: List[str]):
        """
        Indexes clauses and page sections into fine-grained RAG chunks with exact location metadata.
        """
        chunks = []
        # Index structured clauses
        for clause in clauses:
            # Further split long clause texts into 200-word subchunks if necessary
            clause_text = clause["text"].strip()
            chunks.append({
                "doc_id": doc_id,
                "doc_name": doc_name,
                "page_number": clause["page_number"],
                "section_number": clause["section_number"],
                "section_title": clause["title"],
                "text": f"{clause['section_number']}: {clause['title']}\n{clause_text}",
                "clean_text": clause_text,
                "tokens": self._tokenize(f"{clause['section_number']} {clause['title']} {clause_text}")
            })
        
        # Also index general page chunks (to catch preambles, recitals, signatures)
        for p_idx, page in enumerate(pages):
            p_clean = page.strip()
            if p_clean:
                chunks.append({
                    "doc_id": doc_id,
                    "doc_name": doc_name,
                    "page_number": p_idx + 1,
                    "section_number": f"Page {p_idx + 1}",
                    "section_title": f"Page {p_idx + 1} Content",
                    "text": p_clean,
                    "clean_text": p_clean,
                    "tokens": self._tokenize(p_clean)
                })

        self.doc_index[doc_id] = chunks

    def retrieve(self, doc_id: str, query: str, top_k: int = 3, min_score: float = 0.08) -> List[Evidence]:
        """
        Retrieves top-k grounded evidence chunks using TF-IDF / BM25 token matching.
        """
        chunks = self.doc_index.get(doc_id, [])
        if not chunks:
            return []

        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        scored_chunks = []
        for chunk in chunks:
            score = self._compute_similarity(query_tokens, chunk["tokens"])
            if score >= min_score:
                scored_chunks.append((score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        
        # Deduplicate redundant overlapping chunks
        evidences: List[Evidence] = []
        seen_sections = set()
        for score, chunk in scored_chunks:
            sec_key = f"{chunk['page_number']}_{chunk['section_number']}"
            if sec_key in seen_sections:
                continue
            seen_sections.add(sec_key)
            
            # Format clean snippet
            snippet = chunk["clean_text"]
            if len(snippet) > 450:
                snippet = snippet[:450] + "..."

            evidences.append(Evidence(
                doc_name=chunk["doc_name"],
                page_number=chunk["page_number"],
                section_number=chunk["section_number"],
                section_title=chunk["section_title"],
                text=snippet,
                similarity_score=round(min(1.0, score * 1.8), 3)
            ))
            if len(evidences) >= top_k:
                break

        return evidences

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r'\b[a-zA-Z0-9_\-\.\₹\$]{2,}\b', text.lower())
        stopwords = {
            "the", "and", "is", "in", "to", "of", "for", "with", "a", "an", "this", "that",
            "it", "by", "as", "or", "from", "on", "at", "be", "are", "shall", "all", "any"
        }
        return [w for w in words if w not in stopwords]

    def _compute_similarity(self, query_tokens: List[str], doc_tokens: List[str]) -> float:
        if not doc_tokens:
            return 0.0
        doc_token_counts = {}
        for t in doc_tokens:
            doc_token_counts[t] = doc_token_counts.get(t, 0) + 1

        matches = 0
        weight_sum = 0.0
        for q in query_tokens:
            if q in doc_token_counts:
                matches += 1
                # Boost specific high-value legal keywords
                boost = 1.0
                if q in ["terminate", "termination", "notice", "penalty", "deposit", "rent", "obligation", "confidential", "lock-in", "refund", "remedy", "breach", "deadline"]:
                    boost = 2.5
                weight_sum += (1.0 + math.log(1 + doc_token_counts[q])) * boost

        score = weight_sum / (len(query_tokens) + math.sqrt(len(doc_tokens)) * 0.25)
        return score
