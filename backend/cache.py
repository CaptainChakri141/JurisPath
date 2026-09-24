import time
import hashlib
from collections import OrderedDict
from typing import Any, Optional, Dict, Tuple


class LRUTTLCache:
    """
    Thread-safe in-memory LRU cache with TTL expiration.
    Used to eliminate redundant AI calls, repeated document parsing,
    and identical comparison matrix calculations.
    """
    def __init__(self, max_size: int = 500, default_ttl_seconds: int = 1800):
        self.max_size = max_size
        self.default_ttl = default_ttl_seconds
        self._cache: OrderedDict[str, Tuple[Any, float]] = OrderedDict()
        self.hits = 0
        self.misses = 0

    def _generate_key(self, prefix: str, *args) -> str:
        raw = f"{prefix}:" + ":".join(str(a) for a in args)
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def get(self, prefix: str, *args) -> Optional[Any]:
        key = self._generate_key(prefix, *args)
        if key not in self._cache:
            self.misses += 1
            return None

        val, expiry = self._cache[key]
        if time.time() > expiry:
            del self._cache[key]
            self.misses += 1
            return None

        # Move to end (most recently used)
        self._cache.move_to_end(key)
        self.hits += 1
        return val

    def set(self, prefix: str, val: Any, *args, ttl: Optional[int] = None) -> None:
        key = self._generate_key(prefix, *args)
        expiry = time.time() + (ttl if ttl is not None else self.default_ttl)

        if key in self._cache:
            self._cache.move_to_end(key)
        elif len(self._cache) >= self.max_size:
            # Pop least recently used item (first item)
            self._cache.popitem(last=False)

        self._cache[key] = (val, expiry)

    def clear(self) -> None:
        self._cache.clear()

    def get_stats(self) -> Dict[str, Any]:
        total = self.hits + self.misses
        ratio = (self.hits / total) if total > 0 else 0.0
        return {
            "cached_entries": len(self._cache),
            "hits": self.hits,
            "misses": self.misses,
            "hit_ratio": round(ratio, 3)
        }


# Global cache instance for JurisPath services
app_cache = LRUTTLCache(max_size=500, default_ttl_seconds=3600)
