from __future__ import annotations

import numpy as np

from app.attention import (
    Chunk,
    attention_pattern_bundle,
    create_lighthouse_chunks,
    detokenize,
    estimate_attention_edges,
    tokenize_text,
)
from app.embeddings import deterministic_text_embedding, similarity_score
from app.schemas import AnalyzeRequest


def memory_estimates_from_edges(edges: dict[str, int]) -> dict[str, float]:
    def mb(edge_count: int, bytes_per_edge: int) -> float:
        return round(edge_count * bytes_per_edge / (1024 * 1024), 4)

    return {
        "full_attention_mb_fp16": mb(edges["full"], 2),
        "sliding_attention_mb_fp16": mb(edges["sliding_window"], 2),
        "lighthouse_attention_mb_fp16": mb(edges["lighthouse"], 2),
        "full_attention_mb_fp32": mb(edges["full"], 4),
        "sliding_attention_mb_fp32": mb(edges["sliding_window"], 4),
        "lighthouse_attention_mb_fp32": mb(edges["lighthouse"], 4),
    }


def reduction_percent(full: int, method: int) -> float:
    if full <= 0:
        return 0.0
    return round(100.0 * (1.0 - method / full), 2)


def _snippet(tokens: list[str], index: int, radius: int = 18) -> str:
    if not tokens:
        return ""
    start = max(0, index - radius)
    end = min(len(tokens), index + radius + 1)
    return detokenize(tokens[start:end])


def _span(tokens: list[str], index: int, radius: int) -> list[str]:
    start = max(0, index - radius)
    end = min(len(tokens), index + radius + 1)
    return tokens[start:end]


def _best_token_match(
    tokens: list[str],
    query_vector: np.ndarray,
    dim: int,
    indices: range | list[int],
) -> tuple[int, float]:
    if not tokens:
        return 0, 0.0

    span_radius = 10
    best_index = 0
    best_score = -1.0

    for index in indices:
        if index < 0 or index >= len(tokens):
            continue
        span_vector = deterministic_text_embedding(_span(tokens, index, span_radius), dim)
        score = similarity_score(query_vector, span_vector)
        if score > best_score:
            best_index = index
            best_score = score

    return best_index, round(best_score, 4)


def _best_lighthouse_chunk(chunks: list[Chunk], query_vector: np.ndarray, dim: int) -> tuple[Chunk, float]:
    best_chunk = chunks[0]
    best_score = -1.0

    for chunk in chunks:
        # Use summary + keywords only — the guidepost representation, not the full chunk.
        lighthouse_text = chunk.summary + " " + " ".join(chunk.top_keywords)
        chunk_vector = deterministic_text_embedding(lighthouse_text, dim)
        score = similarity_score(query_vector, chunk_vector)
        if score > best_score:
            best_chunk = chunk
            best_score = score

    return best_chunk, round(best_score, 4)


def compute_retrieval_demo(
    document: str,
    query: str,
    window_size: int,
    chunk_size: int,
    dim: int,
    *,
    tokens: list[str] | None = None,
    chunks: list[Chunk] | None = None,
) -> dict[str, object]:
    """Compute the three-way retrieval comparison.

    Pass pre-computed *tokens* and *chunks* to avoid re-tokenising and
    re-chunking inside :func:`analyze_document`.  Both default to ``None``
    so the function remains independently callable (e.g. from tests).
    """
    if tokens is None:
        tokens = tokenize_text(document)
    if not tokens:
        raise ValueError("document must contain at least one token.")
    if chunks is None:
        chunks = create_lighthouse_chunks(tokens, chunk_size)
    query_vector = deterministic_text_embedding(query, dim)

    full_index, full_score = _best_token_match(tokens, query_vector, dim, range(len(tokens)))

    reachable_start = max(0, len(tokens) - window_size)
    reachable_indices = range(reachable_start, len(tokens))
    sliding_index, sliding_score = _best_token_match(tokens, query_vector, dim, reachable_indices)
    can_reach_best = full_index >= reachable_start

    top_chunk, lighthouse_score = _best_lighthouse_chunk(chunks, query_vector, dim)

    if can_reach_best:
        takeaway = (
            "With this window size, sliding-window attention can still reach the strongest evidence. "
            "Lighthouse attention also keeps a global summary path through chunk guideposts."
        )
    else:
        takeaway = (
            "Sliding-window attention cannot directly reach the useful evidence because it is outside "
            "the local window. Lighthouse-style attention can still route the query toward the relevant "
            "chunk summary."
        )

    return {
        "query": query,
        "full_attention": {
            "top_token_index": full_index,
            "score": full_score,
            "snippet": _snippet(tokens, full_index),
        },
        "sliding_window": {
            "can_reach_best_token": can_reach_best,
            "best_reachable_score": sliding_score,
            "snippet": _snippet(tokens, sliding_index),
        },
        "lighthouse_attention": {
            "top_chunk_id": top_chunk.chunk_id,
            "score": lighthouse_score,
            "summary": top_chunk.summary,
            "top_keywords": top_chunk.top_keywords,
        },
        "plain_english_takeaway": takeaway,
    }


def analyze_document(request: AnalyzeRequest) -> dict[str, object]:
    tokens = tokenize_text(request.document)
    if not tokens:
        raise ValueError("document must contain at least one token.")

    edges = estimate_attention_edges(len(tokens), request.window_size, request.chunk_size)
    chunks = create_lighthouse_chunks(tokens, request.chunk_size)
    memory = memory_estimates_from_edges(edges)
    # Pass pre-computed tokens and chunks to avoid a second tokenise+chunk pass.
    retrieval = compute_retrieval_demo(
        request.document,
        request.query,
        request.window_size,
        request.chunk_size,
        request.embedding_dim,
        tokens=tokens,
        chunks=chunks,
    )

    full_edges = edges["full"]

    return {
        "token_count": len(tokens),
        "chunk_count": len(chunks),
        "lighthouse_token_count": len(chunks),
        "edge_counts": edges,
        "reductions": {
            "sliding_vs_full_percent": reduction_percent(full_edges, edges["sliding_window"]),
            "lighthouse_vs_full_percent": reduction_percent(full_edges, edges["lighthouse"]),
        },
        "memory_estimates": memory,
        "attention_patterns": attention_pattern_bundle(
            len(tokens),
            request.window_size,
            request.chunk_size,
            request.visualization_token_cap,
        ),
        "chunks": [
            {
                "chunk_id": chunk.chunk_id,
                "start_token": chunk.start_token,
                "end_token": chunk.end_token,
                "top_keywords": chunk.top_keywords,
                "summary": chunk.summary,
            }
            for chunk in chunks
        ],
        "retrieval": retrieval,
        "runtime_estimates": {
            "edge_count_ratio_lighthouse_to_full": round(edges["lighthouse"] / full_edges, 6),
            "edge_count_ratio_sliding_to_full": round(edges["sliding_window"] / full_edges, 6),
        },
    }
