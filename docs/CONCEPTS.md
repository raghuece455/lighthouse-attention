# Attention Concepts Reference

This document explains the theory behind the three attention strategies demonstrated in Lighthouse Attention Lab. It is written for developers and ML practitioners who want a clear conceptual foundation, not just code.

---

## Table of Contents

- [Tokens and Sequences](#tokens-and-sequences)
- [What is Attention?](#what-is-attention)
- [Full Attention (Dense Attention)](#full-attention-dense-attention)
- [Sliding-Window Attention (Local Attention)](#sliding-window-attention-local-attention)
- [Lighthouse Attention (Hierarchical Attention)](#lighthouse-attention-hierarchical-attention)
- [Complexity Comparison](#complexity-comparison)
- [Memory Cost](#memory-cost)
- [When to Use Each](#when-to-use-each)
- [Relationship to Research Papers](#relationship-to-research-papers)
- [Glossary](#glossary)

---

## Tokens and Sequences

Text is processed as a sequence of **tokens**. A token is typically a word, a sub-word, or a punctuation mark. Most tokenisers (BPE, WordPiece, SentencePiece) produce between 1 and 1.5 tokens per word for English text.

```
Input:  "The stale cache caused the incident."
Tokens: ["The", "stale", "cache", "caused", "the", "incident", "."]
Count:  N = 7
```

A **sequence length** of N means the model must reason over N tokens simultaneously. Modern LLMs operate at sequence lengths from 4,096 (GPT-3.5) to 128,000+ (GPT-4 Turbo, Claude).

---

## What is Attention?

Attention is the mechanism that lets each token in a sequence gather information from other tokens. Given a **query token** q and a set of **key-value tokens** (k, v), attention computes a weighted sum of the values, where the weights come from the similarity between q and each k.

```
Attention(q, K, V) = softmax(q · Kᵀ / √d) · V
```

The key insight is **which (q, k) pairs are even evaluated**. The set of allowed pairs is the **attention pattern** — and this is what the three strategies differ on.

---

## Full Attention (Dense Attention)

### Definition

Every query token can attend to every key token. The attention pattern is a complete N × N matrix.

```
Attention pattern (N=6):

     k0   k1   k2   k3   k4   k5
q0 [  ■    ■    ■    ■    ■    ■  ]
q1 [  ■    ■    ■    ■    ■    ■  ]
q2 [  ■    ■    ■    ■    ■    ■  ]
q3 [  ■    ■    ■    ■    ■    ■  ]
q4 [  ■    ■    ■    ■    ■    ■  ]
q5 [  ■    ■    ■    ■    ■    ■  ]

■ = allowed   ·  = blocked
```

### Complexity

| Resource | Cost |
|---|---|
| Attention computation | O(N²·d) |
| Memory for attention weights | O(N²) |
| Connections | N² |

### Strengths

- Maximum information access: any token can influence any other token.
- Optimal for tasks where distant dependencies matter (question answering over long documents, multi-hop reasoning).

### Weaknesses

- Quadratic memory and compute. At N=32,768 with fp16, the attention weight matrix alone requires **2 GB per layer per head**.
- Practically infeasible beyond ~4,096 tokens without tricks (chunking, FlashAttention, etc.).

---

## Sliding-Window Attention (Local Attention)

### Definition

Each token can only attend to a fixed-size window of W tokens on either side. The attention pattern is a diagonal band.

```
Attention pattern (N=8, W=2):

     k0   k1   k2   k3   k4   k5   k6   k7
q0 [  ■    ■    ■    ·    ·    ·    ·    ·  ]
q1 [  ■    ■    ■    ■    ·    ·    ·    ·  ]
q2 [  ■    ■    ■    ■    ■    ·    ·    ·  ]
q3 [  ·    ■    ■    ■    ■    ■    ·    ·  ]
q4 [  ·    ·    ■    ■    ■    ■    ■    ·  ]
q5 [  ·    ·    ·    ■    ■    ■    ■    ■  ]
q6 [  ·    ·    ·    ·    ■    ■    ■    ■  ]
q7 [  ·    ·    ·    ·    ·    ■    ■    ■  ]
```

### Edge count formula

For each token i, the number of reachable tokens is:

```
window(i) = min(i + W, N − 1) − max(0, i − W) + 1
```

Exact total (O(1) closed-form):

```
K     = min(W, N − 1)
edges = N × (2K + 1) − K × (K + 1)
```

Approximation (ignores boundary effects):

```
edges ≈ N × (2W + 1)
```

### Complexity

| Resource | Cost |
|---|---|
| Attention computation | O(N · W · d) |
| Memory for attention weights | O(N · W) |
| Connections | ~N × (2W+1) |

### Strengths

- Linear in N (for fixed W). Can scale to very long sequences.
- Captures local syntactic and semantic context well.

### Weaknesses

- **Cannot propagate information across distances greater than W tokens per layer.**
- For the final query token at position N−1, the farthest reachable position is N−1−W. Evidence at position 0 is unreachable if N > W+1.
- Multi-layer stacking partially mitigates this (information can hop W tokens per layer), but requires many layers to span long documents.

### The blocked-evidence failure

```
Document:  [Critical fact: token 0]──────498 filler tokens──────[QUERY: token 499]

W = 32:  QUERY window = [467..499]
         Token 0 is at distance 499 from QUERY — unreachable in one layer.
```

---

## Lighthouse Attention (Hierarchical Attention)

### Definition

Lighthouse attention adds a second tier of **summary tokens** (lighthouse tokens) that serve as global guideposts. The construction:

1. Split the N tokens into chunks of size C. This creates L = ⌈N/C⌉ chunks.
2. Each chunk gets one **lighthouse token** — an extractive summary of that chunk.
3. Normal tokens attend to: their local window (like sliding-window) + **all L lighthouse tokens**.
4. Lighthouse tokens attend to: their own chunk's tokens + **all other lighthouse tokens**.

```
Attention pattern (N=8, W=2, C=4  →  L=2):

     T0   T1   T2   T3   T4   T5   T6   T7   L0   L1
T0 [  ■    ■    ■    ·    ·    ·    ·    ·    ◆    ◆  ]
T1 [  ■    ■    ■    ■    ·    ·    ·    ·    ◆    ◆  ]
T2 [  ■    ■    ■    ■    ■    ·    ·    ·    ◆    ◆  ]   normal tokens:
T3 [  ·    ■    ■    ■    ■    ■    ·    ·    ◆    ◆  ]   local window (■)
T4 [  ·    ·    ■    ■    ■    ■    ■    ·    ◆    ◆  ]   + lighthouse (◆)
T5 [  ·    ·    ·    ■    ■    ■    ■    ■    ◆    ◆  ]
T6 [  ·    ·    ·    ·    ■    ■    ■    ■    ◆    ◆  ]
T7 [  ·    ·    ·    ·    ·    ■    ■    ■    ◆    ◆  ]
──────────────────────────────────────────────────────
L0 [  ▲    ▲    ▲    ▲    ·    ·    ·    ·    ●    ●  ]   lighthouse tokens:
L1 [  ·    ·    ·    ·    ▲    ▲    ▲    ▲    ●    ●  ]   own chunk (▲)
                                                           + lighthouse (●)

■ local    ◆ token→lighthouse    ▲ lighthouse→chunk    ● lighthouse↔lighthouse
```

### Edge count formula

```
edges = sliding_window_edges          ← normal token local windows
      + N × L                         ← every token → every lighthouse
      + N                             ← lighthouse reads own chunk (≈ N total across all lighthouses)
      + L × L                         ← lighthouse ↔ lighthouse

where L = ⌈N / C⌉
```

### How the query routes to distant evidence

```
Step 1 — QUERY fires locally:
  QUERY → {T(N−W), ..., T(N−1)}  (nearby tokens via sliding window)

Step 2 — QUERY fires to all lighthouse tokens:
  QUERY → L0 → (reads T0..T(C−1))
  QUERY → L1 → (reads T(C)..T(2C−1))
  ...
  QUERY → Lk → (reads T(kC)..T((k+1)C−1))

Step 3 — Best matching lighthouse routes QUERY to its chunk:
  The lighthouse token with highest similarity to QUERY
  carries information from that chunk back to the QUERY.

Result:
  Even if the critical fact is at token 0 and QUERY is at token 499,
  L0 has read tokens 0-127 and can bridge the distance.
```

### Complexity

| Resource | Cost |
|---|---|
| Attention computation | O(N·W·d + N·L·d + L²·d) |
| Memory for attention weights | O(N·W + N·L + L²) |
| Connections | ~N·(2W+1) + N·L + L² |

For typical parameters (W=32, C=128, so L=N/128):

```
edges ≈ N·65 + N·(N/128) + (N/128)²
      ≈ 65N  + N²/128    + N²/16384
```

The N²/128 term is the dominant growth, but it is 128× smaller than full attention.

### Complexity

| N | Full (N²) | Sliding (N·65) | Lighthouse | Lighthouse/Full |
|---:|---:|---:|---:|---:|
| 512 | 262,144 | 33,280 | 34,816 | 13.3% |
| 1,024 | 1,048,576 | 66,560 | 69,888 | 6.7% |
| 4,096 | 16,777,216 | 266,240 | 279,040 | 1.7% |
| 32,768 | 1,073,741,824 | 2,129,920 | 2,162,688 | 0.2% |

As N grows, lighthouse attention approaches the same cost as sliding-window because L² stays small.

---

## Complexity Comparison

```
Method          Time complexity      Memory complexity
─────────────────────────────────────────────────────
Full            O(N² · d)            O(N²)
Sliding-window  O(N · W · d)         O(N · W)
Lighthouse      O((N·W + N·L) · d)   O(N·W + N·L + L²)
```

Where:
- N = sequence length
- d = head dimension
- W = window size
- L = number of lighthouse tokens = ⌈N / C⌉
- C = chunk size

---

## Memory Cost

Attention weights are stored as 32-bit (fp32) or 16-bit (fp16) floats.

```
memory_MB = edges × bytes_per_weight / (1024 × 1024)

fp16:  2 bytes per weight
fp32:  4 bytes per weight
```

For a single attention head at N=4,096:

| Method | Edges | fp16 memory | fp32 memory |
|---|---:|---:|---:|
| Full | 16,777,216 | 32.0 MB | 64.0 MB |
| Sliding (W=32) | 266,240 | 0.51 MB | 1.02 MB |
| Lighthouse (W=32, C=128) | 279,040 | 0.53 MB | 1.07 MB |

Real models have multiple heads and multiple layers. GPT-3 has 96 layers × 96 heads, making full-attention memory 96 × 96 × 32 MB = **295 GB per forward pass** at N=4,096. Efficient attention is not optional at scale.

---

## When to Use Each

| Scenario | Recommended approach |
|---|---|
| Short sequences (N < 512) | Full attention — cost is manageable, maximum accuracy |
| Long sequences, local context sufficient | Sliding-window — cheap, scalable |
| Long sequences, distant evidence possible | Lighthouse or similar hierarchical approach |
| Production models at scale | FlashAttention (exact) or sparse patterns (BigBird, Longformer) |
| Educational / research demo | This project — deterministic, no GPU required |

---

## Relationship to Research Papers

Lighthouse attention as implemented here is an **educational simplification** of ideas from several real research papers:

| Concept | Paper | How it relates |
|---|---|---|
| Local window + global tokens | Longformer (Beltagy et al., 2020) | Longformer adds global tokens that attend to all positions; lighthouse tokens are similar in role |
| Sparse local + random + global | BigBird (Zaheer et al., 2020) | BigBird proves O(N) attention is universal; lighthouse uses the global-token component |
| Hierarchical summarisation | Efficient Transformers survey (Tay et al., 2020) | Reviews pooling-based approaches that compress sequences |
| IO-efficient exact attention | FlashAttention (Dao et al., 2022) | Reduces memory by recomputing attention on-chip rather than materialising the full matrix |

**Key difference from production implementations:** In this demo, lighthouse tokens are static extractive summaries computed before inference. In real models (Longformer, BigBird), the global tokens are learned parameters updated during training.

---

## Glossary

| Term | Definition |
|---|---|
| **Token** | Smallest unit of text the model processes. Usually a word, sub-word, or punctuation piece. |
| **Sequence length (N)** | Number of tokens in the input. |
| **Attention** | Mechanism that computes a weighted sum of value vectors based on query-key similarity. |
| **Attention pattern** | The binary mask defining which (query, key) pairs are evaluated. |
| **Full attention** | Attention pattern where all N² pairs are allowed. |
| **Sliding-window attention** | Attention pattern restricted to a diagonal band of width 2W+1. |
| **Window size (W)** | Radius of the local window in sliding-window and lighthouse attention. |
| **Chunk** | A contiguous block of C tokens. The document is divided into ⌈N/C⌉ chunks. |
| **Chunk size (C)** | Number of tokens per chunk. Controls how many lighthouse tokens exist. |
| **Lighthouse token** | A summary token that represents one chunk. Attends to its chunk and all other lighthouse tokens. |
| **L (lighthouse count)** | Number of lighthouse tokens = ⌈N/C⌉. |
| **Edge** | A single allowed (query, key) pair — one connection in the attention pattern. |
| **fp16** | 16-bit floating point. 2 bytes per attention weight. |
| **fp32** | 32-bit floating point. 4 bytes per attention weight. |
| **Deterministic embedding** | A vector representation computed from a fixed hash function, not a trained model. Produces real, repeatable similarity values. |
| **Extractive summary** | A summary built by selecting existing sentences from the source text, not generating new ones. |
