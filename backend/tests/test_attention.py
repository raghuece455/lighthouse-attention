import math

from app.attention import (
    build_attention_pattern,
    create_lighthouse_chunks,
    estimate_attention_edges,
    tokenize_text,
)
from app.analysis import compute_retrieval_demo, memory_estimates_from_edges, reduction_percent
from app.benchmark import validate_lengths


def test_edge_counts_full_is_larger_for_long_sequence():
    edges = estimate_attention_edges(seq_len=1024, window_size=32, chunk_size=128)

    assert edges["full"] > edges["lighthouse"]
    assert edges["full"] > edges["sliding_window"]


def test_lighthouse_pattern_includes_lighthouse_tokens():
    seq_len = 128
    chunk_size = 32

    pattern = build_attention_pattern(
        seq_len=seq_len,
        window_size=8,
        chunk_size=chunk_size,
        mode="lighthouse",
        cap=seq_len,
    )

    expected_size = seq_len + math.ceil(seq_len / chunk_size)
    assert len(pattern) == expected_size
    assert len(pattern[0]) == expected_size


def test_tokenizer_returns_non_empty_tokens():
    tokens = tokenize_text("Root cause: stale cache TTL was forty eight hours.")

    assert tokens
    assert "cache" in [token.lower() for token in tokens]


def test_retrieval_blocks_early_evidence_for_sliding_window():
    early = "Root cause alpha beacon: stale cache ttl must be five minutes. "
    filler = " ".join(f"routine operations note {i} with general status updates." for i in range(180))
    document = early + filler
    query = "What root cause alpha beacon setting should change?"

    result = compute_retrieval_demo(
        document=document,
        query=query,
        window_size=16,
        chunk_size=64,
        dim=64,
    )

    assert result["sliding_window"]["can_reach_best_token"] is False
    assert result["lighthouse_attention"]["top_chunk_id"] >= 0
    assert isinstance(result["full_attention"]["score"], float)
    assert isinstance(result["sliding_window"]["best_reachable_score"], float)


# --- create_lighthouse_chunks ---

def test_chunks_cover_all_tokens():
    tokens = tokenize_text("alpha beta gamma delta epsilon zeta eta theta iota kappa")
    chunks = create_lighthouse_chunks(tokens, chunk_size=4)

    covered = sum(chunk.end_token - chunk.start_token + 1 for chunk in chunks)
    assert covered == len(tokens)


def test_chunk_ids_are_sequential():
    tokens = tokenize_text("one two three four five six seven eight nine ten eleven twelve")
    chunks = create_lighthouse_chunks(tokens, chunk_size=4)

    for i, chunk in enumerate(chunks):
        assert chunk.chunk_id == i


def test_single_chunk_when_tokens_fit():
    tokens = tokenize_text("hello world")
    chunks = create_lighthouse_chunks(tokens, chunk_size=100)

    assert len(chunks) == 1
    assert chunks[0].start_token == 0


def test_chunk_summary_is_non_empty():
    tokens = tokenize_text(
        "The filtration module warranty requires cartridge replacement before 500 hours."
    )
    chunks = create_lighthouse_chunks(tokens, chunk_size=20)

    for chunk in chunks:
        assert chunk.summary


def test_chunk_keywords_are_present():
    tokens = tokenize_text("cache invalidation stale flag ttl refresh")
    chunks = create_lighthouse_chunks(tokens, chunk_size=10)

    assert len(chunks) == 1
    assert len(chunks[0].top_keywords) > 0


# --- memory_estimates_from_edges ---

def test_fp32_is_double_fp16():
    edges = estimate_attention_edges(seq_len=512, window_size=32, chunk_size=128)
    memory = memory_estimates_from_edges(edges)

    assert math.isclose(
        memory["full_attention_mb_fp32"],
        memory["full_attention_mb_fp16"] * 2,
        rel_tol=1e-6,
    )


def test_full_attention_memory_larger_than_lighthouse():
    edges = estimate_attention_edges(seq_len=1024, window_size=32, chunk_size=128)
    memory = memory_estimates_from_edges(edges)

    assert memory["full_attention_mb_fp16"] > memory["lighthouse_attention_mb_fp16"]


# --- reduction_percent ---

def test_reduction_percent_full_equals_method_is_zero():
    assert reduction_percent(100, 100) == 0.0


def test_reduction_percent_half_edges_is_fifty():
    assert reduction_percent(100, 50) == 50.0


def test_reduction_percent_zero_full_returns_zero():
    assert reduction_percent(0, 50) == 0.0


# --- validate_lengths ---

def test_validate_lengths_deduplicates_and_sorts():
    result = validate_lengths([1024, 256, 256, 512])
    assert result == [256, 512, 1024]


def test_validate_lengths_caps_list_at_twelve():
    long_list = list(range(1, 20))
    result = validate_lengths(long_list)
    assert len(result) <= 12


def test_validate_lengths_drops_non_positive():
    result = validate_lengths([-1, 0, 256, 512])
    assert all(v > 0 for v in result)
    assert 256 in result


def test_validate_lengths_empty_returns_defaults():
    result = validate_lengths([])
    assert result == [256, 512, 1024, 2048, 4096]


def test_validate_lengths_caps_individual_values():
    result = validate_lengths([999_999_999])
    assert all(v <= 65_536 for v in result)
