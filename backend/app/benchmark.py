from __future__ import annotations

import logging

from app.analysis import memory_estimates_from_edges, reduction_percent
from app.attention import estimate_attention_edges

logger = logging.getLogger(__name__)


def validate_lengths(lengths: list[int]) -> list[int]:
    """Deduplicate, sort, and cap the sequence-length list for benchmarking.

    Individual lengths are capped at 65_536 so the response stays within a
    reasonable range even when a caller passes an extreme value.
    """
    MAX_SINGLE = 65_536
    clean = sorted(
        {min(int(length), MAX_SINGLE) for length in lengths if int(length) > 0}
    )
    if not clean:
        return [256, 512, 1024, 2048, 4096]
    return clean[:12]


def _runtime_ms(edges: int) -> float:
    # Safe estimate based on conceptual attention edges only. We do not allocate
    # large dense matrices for benchmark requests.
    return round(edges / 1_500_000, 3)


def run_benchmark(lengths: list[int], window_size: int, chunk_size: int) -> dict[str, object]:
    safe_lengths = validate_lengths(lengths)
    logger.debug(
        "benchmark: window_size=%d chunk_size=%d lengths=%s",
        window_size,
        chunk_size,
        safe_lengths,
    )
    points = []
    for length in safe_lengths:
        edges = estimate_attention_edges(length, window_size, chunk_size)
        points.append(
            {
                "length": length,
                "edge_counts": edges,
                "reductions": {
                    "sliding_vs_full_percent": reduction_percent(edges["full"], edges["sliding_window"]),
                    "lighthouse_vs_full_percent": reduction_percent(edges["full"], edges["lighthouse"]),
                },
                "memory_estimates": memory_estimates_from_edges(edges),
                "safe_runtime_estimates_ms": {
                    "full": _runtime_ms(edges["full"]),
                    "sliding_window": _runtime_ms(edges["sliding_window"]),
                    "lighthouse": _runtime_ms(edges["lighthouse"]),
                },
            }
        )

    return {"points": points}
