export type ExampleDocument = {
  id: string;
  title: string;
  description: string;
  document: string;
  query: string;
  hidden_fact_position_hint: string;
};

export type AnalyzePayload = {
  document: string;
  query: string;
  window_size: number;
  chunk_size: number;
  embedding_dim: number;
  visualization_token_cap: number;
};

export type EdgeCounts = {
  full: number;
  sliding_window: number;
  lighthouse: number;
};

export type Reductions = {
  sliding_vs_full_percent: number;
  lighthouse_vs_full_percent: number;
};

export type MemoryEstimates = {
  full_attention_mb_fp16: number;
  sliding_attention_mb_fp16: number;
  lighthouse_attention_mb_fp16: number;
  full_attention_mb_fp32: number;
  sliding_attention_mb_fp32: number;
  lighthouse_attention_mb_fp32: number;
};

export type AttentionPatterns = {
  visual_token_count: number;
  visual_lighthouse_count: number;
  full: number[][];
  sliding: number[][];
  lighthouse: number[][];
  legend: Record<string, string>;
};

export type ChunkInfo = {
  chunk_id: number;
  start_token: number;
  end_token: number;
  top_keywords: string[];
  summary: string;
};

export type RetrievalResult = {
  query: string;
  full_attention: {
    top_token_index: number;
    score: number;
    snippet: string;
  };
  sliding_window: {
    can_reach_best_token: boolean;
    best_reachable_score: number;
    snippet: string;
  };
  lighthouse_attention: {
    top_chunk_id: number;
    score: number;
    summary: string;
    top_keywords: string[];
  };
  plain_english_takeaway: string;
};

export type AnalyzeResponse = {
  token_count: number;
  chunk_count: number;
  lighthouse_token_count: number;
  edge_counts: EdgeCounts;
  reductions: Reductions;
  memory_estimates: MemoryEstimates;
  attention_patterns: AttentionPatterns;
  chunks: ChunkInfo[];
  retrieval: RetrievalResult;
  runtime_estimates: {
    edge_count_ratio_lighthouse_to_full: number;
    edge_count_ratio_sliding_to_full: number;
  };
};

export type BenchmarkPayload = {
  lengths: number[];
  window_size: number;
  chunk_size: number;
};

export type BenchmarkPoint = {
  length: number;
  edge_counts: EdgeCounts;
  reductions: Reductions;
  memory_estimates: MemoryEstimates;
  safe_runtime_estimates_ms: Record<string, number>;
};

export type BenchmarkResponse = {
  points: BenchmarkPoint[];
};
