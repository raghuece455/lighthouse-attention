from __future__ import annotations

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str


class ExampleDocument(BaseModel):
    id: str
    title: str
    description: str
    document: str
    query: str
    hidden_fact_position_hint: str


class AnalyzeRequest(BaseModel):
    # 50 000-char ceiling: generous for long demos, prevents accidental DoS.
    document: str = Field(..., min_length=1, max_length=50_000)
    query: str = Field(..., min_length=1, max_length=2_000)
    window_size: int = Field(32, ge=1, le=512)
    chunk_size: int = Field(128, ge=8, le=1024)
    embedding_dim: int = Field(64, ge=8, le=512)
    visualization_token_cap: int = Field(160, ge=32, le=256)


class BenchmarkRequest(BaseModel):
    # max_length=12 mirrors the cap inside validate_lengths.
    lengths: list[int] = Field(
        default_factory=lambda: [256, 512, 1024, 2048, 4096],
        max_length=12,
    )
    window_size: int = Field(32, ge=1, le=512)
    chunk_size: int = Field(128, ge=8, le=4096)


class EdgeCounts(BaseModel):
    full: int
    sliding_window: int
    lighthouse: int


class Reductions(BaseModel):
    sliding_vs_full_percent: float
    lighthouse_vs_full_percent: float


class MemoryEstimates(BaseModel):
    full_attention_mb_fp16: float
    sliding_attention_mb_fp16: float
    lighthouse_attention_mb_fp16: float
    full_attention_mb_fp32: float
    sliding_attention_mb_fp32: float
    lighthouse_attention_mb_fp32: float


class AttentionPatterns(BaseModel):
    visual_token_count: int
    visual_lighthouse_count: int
    full: list[list[int]]
    sliding: list[list[int]]
    lighthouse: list[list[int]]
    legend: dict[str, str]


class ChunkInfo(BaseModel):
    chunk_id: int
    start_token: int
    end_token: int
    top_keywords: list[str]
    summary: str


class FullRetrieval(BaseModel):
    top_token_index: int
    score: float
    snippet: str


class SlidingRetrieval(BaseModel):
    can_reach_best_token: bool
    best_reachable_score: float
    snippet: str


class LighthouseRetrieval(BaseModel):
    top_chunk_id: int
    score: float
    summary: str
    top_keywords: list[str]


class RetrievalResult(BaseModel):
    query: str
    full_attention: FullRetrieval
    sliding_window: SlidingRetrieval
    lighthouse_attention: LighthouseRetrieval
    plain_english_takeaway: str


class RuntimeEstimates(BaseModel):
    edge_count_ratio_lighthouse_to_full: float
    edge_count_ratio_sliding_to_full: float


class AnalyzeResponse(BaseModel):
    token_count: int
    chunk_count: int
    lighthouse_token_count: int
    edge_counts: EdgeCounts
    reductions: Reductions
    memory_estimates: MemoryEstimates
    attention_patterns: AttentionPatterns
    chunks: list[ChunkInfo]
    retrieval: RetrievalResult
    runtime_estimates: RuntimeEstimates


class BenchmarkPoint(BaseModel):
    length: int
    edge_counts: EdgeCounts
    reductions: Reductions
    memory_estimates: MemoryEstimates
    safe_runtime_estimates_ms: dict[str, float]


class BenchmarkResponse(BaseModel):
    points: list[BenchmarkPoint]
