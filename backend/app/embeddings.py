from __future__ import annotations

import hashlib
import math

import numpy as np

from app.attention import tokenize_text


def _tokens_from_input(text_or_tokens: str | list[str]) -> list[str]:
    if isinstance(text_or_tokens, str):
        return tokenize_text(text_or_tokens)
    return list(text_or_tokens)


def deterministic_text_embedding(text_or_tokens: str | list[str], dim: int) -> np.ndarray:
    """Create deterministic signed-hashing embeddings with no model downloads.

    This is not a semantic language model. It is a transparent toy vectorizer that
    still produces real, repeatable similarity values from the user's text.
    """
    if dim <= 0:
        raise ValueError("dim must be positive.")

    vector = np.zeros(dim, dtype=np.float64)
    tokens = [token.lower() for token in _tokens_from_input(text_or_tokens) if token.strip()]

    for token in tokens:
        digest = hashlib.blake2b(token.encode("utf-8"), digest_size=16).digest()

        # Add each token into two signed dimensions. This reduces collisions while
        # staying deterministic and dependency-free.
        first = int.from_bytes(digest[0:4], "little")
        second = int.from_bytes(digest[4:8], "little")
        third = int.from_bytes(digest[8:12], "little")
        fourth = int.from_bytes(digest[12:16], "little")

        vector[first % dim] += 1.0 if second & 1 else -1.0
        vector[third % dim] += 0.7 if fourth & 1 else -0.7

    norm = math.sqrt(float(np.dot(vector, vector)))
    if norm == 0:
        return vector
    return vector / norm


def similarity_score(left: np.ndarray, right: np.ndarray) -> float:
    """Return cosine similarity mapped into a friendly 0..1 range."""
    raw = float(np.dot(left, right))
    return max(0.0, min(1.0, (raw + 1.0) / 2.0))
