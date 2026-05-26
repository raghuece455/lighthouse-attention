import numpy as np

from app.embeddings import deterministic_text_embedding


def test_embedding_is_deterministic_and_normalized():
    first = deterministic_text_embedding("stale cache ttl", dim=64)
    second = deterministic_text_embedding("stale cache ttl", dim=64)

    assert np.allclose(first, second)
    assert np.isclose(np.linalg.norm(first), 1.0)


def test_different_text_changes_embedding():
    first = deterministic_text_embedding("stale cache ttl", dim=64)
    second = deterministic_text_embedding("warranty cartridge seal", dim=64)

    assert not np.allclose(first, second)
