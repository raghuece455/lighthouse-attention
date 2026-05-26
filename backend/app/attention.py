from __future__ import annotations

import math
import re
from collections import Counter
from dataclasses import dataclass


TOKEN_PATTERN = re.compile(r"[A-Za-z]+(?:[-'][A-Za-z]+)?|\d+(?:\.\d+)?|[^\w\s]", re.UNICODE)

STOPWORDS = {
    "a",
    "about",
    "above",
    "after",
    "again",
    "against",
    "all",
    "also",
    "am",
    "an",
    "and",
    "any",
    "are",
    "as",
    "at",
    "be",
    "because",
    "been",
    "before",
    "being",
    "below",
    "between",
    "both",
    "but",
    "by",
    "can",
    "could",
    "did",
    "do",
    "does",
    "doing",
    "down",
    "during",
    "each",
    "few",
    "for",
    "from",
    "further",
    "had",
    "has",
    "have",
    "having",
    "he",
    "her",
    "here",
    "hers",
    "him",
    "his",
    "how",
    "i",
    "if",
    "in",
    "into",
    "is",
    "it",
    "its",
    "itself",
    "just",
    "me",
    "more",
    "most",
    "my",
    "no",
    "nor",
    "not",
    "now",
    "of",
    "off",
    "on",
    "once",
    "only",
    "or",
    "other",
    "our",
    "out",
    "over",
    "own",
    "same",
    "she",
    "should",
    "so",
    "some",
    "such",
    "than",
    "that",
    "the",
    "their",
    "them",
    "then",
    "there",
    "these",
    "they",
    "this",
    "those",
    "through",
    "to",
    "too",
    "under",
    "until",
    "up",
    "very",
    "was",
    "we",
    "were",
    "what",
    "when",
    "where",
    "which",
    "while",
    "who",
    "why",
    "will",
    "with",
    "would",
    "you",
    "your",
}


@dataclass(frozen=True)
class Chunk:
    chunk_id: int
    start_token: int
    end_token: int
    text: str
    top_keywords: list[str]
    summary: str


def tokenize_text(text: str) -> list[str]:
    """Tokenize text into deterministic word, number, and punctuation pieces."""
    return TOKEN_PATTERN.findall(text or "")


def detokenize(tokens: list[str]) -> str:
    """Turn simple regex tokens back into readable text."""
    if not tokens:
        return ""

    text = " ".join(tokens)
    text = re.sub(r"\s+([,.;:!?%)\]])", r"\1", text)
    text = re.sub(r"([\[(])\s+", r"\1", text)
    text = text.replace(" n't", "n't")
    text = text.replace(" 's", "'s")
    return text.strip()


def _normalized_word(token: str) -> str | None:
    token = token.lower().strip()
    token = re.sub(r"[^a-z0-9-]", "", token)
    if len(token) < 3 or token in STOPWORDS:
        return None
    if token.isdigit():
        return None
    return token


def _keyword_counts(tokens: list[str]) -> Counter[str]:
    words = [_normalized_word(token) for token in tokens]
    return Counter(word for word in words if word)


def _sentence_spans(tokens: list[str]) -> list[tuple[int, list[str]]]:
    """Return (start_index, sentence_tokens) pairs so callers never need list.index()."""
    spans: list[tuple[int, list[str]]] = []
    current: list[str] = []
    start = 0

    for i, token in enumerate(tokens):
        current.append(token)
        if token in {".", "!", "?"} and current:
            spans.append((start, current))
            start = i + 1
            current = []

    if current:
        spans.append((start, current))

    return spans


def _summarize_chunk(tokens: list[str], counts: Counter[str]) -> str:
    if not tokens:
        return ""

    spans = _sentence_spans(tokens)
    if not spans:
        spans = [(0, tokens)]

    def score(span: tuple[int, list[str]]) -> float:
        words = [_normalized_word(token) for token in span[1]]
        clean_words = [word for word in words if word]
        if not clean_words:
            return 0.0
        return sum(counts[word] for word in clean_words) / math.sqrt(len(clean_words))

    best_start, best = max(spans, key=score)
    clean = [token for token in best if token.strip()]

    # Keep summaries short enough for cards, while preserving whole-token text.
    if len(clean) < 18 and len(tokens) > len(clean):
        clean = tokens[best_start : min(len(tokens), best_start + 28)]
    elif len(clean) > 35:
        clean = clean[:35]

    return detokenize(clean)


def create_lighthouse_chunks(tokens: list[str], chunk_size: int) -> list[Chunk]:
    """Split tokens into chunks and create simple extractive summaries."""
    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive.")

    chunks: list[Chunk] = []
    for chunk_id, start in enumerate(range(0, len(tokens), chunk_size)):
        end_exclusive = min(start + chunk_size, len(tokens))
        chunk_tokens = tokens[start:end_exclusive]
        counts = _keyword_counts(chunk_tokens)
        top_keywords = [word for word, _ in counts.most_common(6)]
        summary = _summarize_chunk(chunk_tokens, counts)
        chunks.append(
            Chunk(
                chunk_id=chunk_id,
                start_token=start,
                end_token=max(start, end_exclusive - 1),
                text=detokenize(chunk_tokens),
                top_keywords=top_keywords,
                summary=summary,
            )
        )

    return chunks


def _local_edge_count(seq_len: int, window_size: int) -> int:
    # Closed-form O(1): count pairs (i, j) with |i-j| <= W.
    # For offset d=0 there are N pairs; for d=1..K there are 2*(N-d) pairs.
    # Total = N*(2K+1) - K*(K+1), where K = min(W, N-1).
    k = min(window_size, seq_len - 1)
    return seq_len * (2 * k + 1) - k * (k + 1)


def estimate_attention_edges(seq_len: int, window_size: int, chunk_size: int) -> dict[str, int]:
    """Estimate attention edge counts with exact local-window boundaries."""
    if seq_len <= 0:
        raise ValueError("seq_len must be positive.")
    if window_size < 0:
        raise ValueError("window_size must be non-negative.")
    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive.")

    num_lighthouses = math.ceil(seq_len / chunk_size)
    full = seq_len * seq_len
    sliding = _local_edge_count(seq_len, window_size)

    original_to_local = sliding
    original_to_lighthouses = seq_len * num_lighthouses
    lighthouse_to_own_chunk = seq_len
    lighthouse_to_lighthouses = num_lighthouses * num_lighthouses

    lighthouse = (
        original_to_local
        + original_to_lighthouses
        + lighthouse_to_own_chunk
        + lighthouse_to_lighthouses
    )

    return {
        "full": full,
        "sliding_window": sliding,
        "lighthouse": lighthouse,
    }


def build_attention_pattern(
    seq_len: int,
    window_size: int,
    chunk_size: int,
    mode: str,
    cap: int,
) -> list[list[int]]:
    """Create a compact integer-coded attention pattern for visualization."""
    if seq_len <= 0:
        raise ValueError("seq_len must be positive.")
    if window_size < 0:
        raise ValueError("window_size must be non-negative.")
    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive.")
    if cap <= 0:
        raise ValueError("cap must be positive.")

    visual_seq_len = min(seq_len, cap)

    if mode == "full":
        return [[1 for _ in range(visual_seq_len)] for _ in range(visual_seq_len)]

    if mode == "sliding":
        return [
            [1 if abs(i - j) <= window_size else 0 for j in range(visual_seq_len)]
            for i in range(visual_seq_len)
        ]

    if mode != "lighthouse":
        raise ValueError("mode must be one of: full, sliding, lighthouse.")

    visual_lighthouses = math.ceil(visual_seq_len / chunk_size)
    total = visual_seq_len + visual_lighthouses
    matrix = [[0 for _ in range(total)] for _ in range(total)]

    for i in range(visual_seq_len):
        for j in range(visual_seq_len):
            if abs(i - j) <= window_size:
                matrix[i][j] = 1
        for lighthouse_idx in range(visual_lighthouses):
            matrix[i][visual_seq_len + lighthouse_idx] = 2

    for lighthouse_idx in range(visual_lighthouses):
        row = visual_seq_len + lighthouse_idx
        start = lighthouse_idx * chunk_size
        end = min(start + chunk_size, visual_seq_len)

        for col in range(start, end):
            matrix[row][col] = 3
        for other in range(visual_lighthouses):
            matrix[row][visual_seq_len + other] = 4

    return matrix


def attention_pattern_bundle(
    seq_len: int,
    window_size: int,
    chunk_size: int,
    cap: int,
) -> dict[str, object]:
    visual_seq_len = min(seq_len, cap)
    visual_lighthouse_count = math.ceil(visual_seq_len / chunk_size)
    return {
        "visual_token_count": visual_seq_len,
        "visual_lighthouse_count": visual_lighthouse_count,
        "full": build_attention_pattern(seq_len, window_size, chunk_size, "full", cap),
        "sliding": build_attention_pattern(seq_len, window_size, chunk_size, "sliding", cap),
        "lighthouse": build_attention_pattern(seq_len, window_size, chunk_size, "lighthouse", cap),
        "legend": {
            "0": "blocked",
            "1": "local attention",
            "2": "lighthouse summary access",
            "3": "lighthouse reads own chunk",
            "4": "lighthouse-to-lighthouse",
        },
    }
