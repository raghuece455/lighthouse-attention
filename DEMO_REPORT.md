# Demo Report

## What Was Built

Lighthouse Attention Lab is a full-stack educational demo with a FastAPI backend and a React/TypeScript frontend. It compares full attention, sliding-window attention, and lighthouse-style attention using live values computed from the selected document and query.

The frontend includes:

- A polished dark product-demo interface
- Interactive document/query controls
- Computed metric cards
- Canvas attention heatmaps with hover tooltips
- Retrieval comparison cards
- Document chunk explorer with highlighted lighthouse selection
- Benchmark charts for edge counts and fp16 memory estimates
- A story animation explaining the lighthouse metaphor

## How the Backend Computes Real Values

The backend uses deterministic local algorithms:

- Regex tokenization for words, numbers, and punctuation
- Exact local-window edge counts with boundary handling
- Lighthouse edge counts based on original-token rows plus summary-token rows
- Integer-coded attention masks for visualization
- Extractive chunk summaries based on keyword density
- Deterministic signed-hashing embeddings using `hashlib.blake2b`
- Similarity-based retrieval simulation with no external model downloads
- Memory estimates based on fp16 and fp32 bytes per attention edge

The retrieval simulation treats the query as if it appears at the end of the document. Full attention can compare against all spans, sliding-window attention can only compare against the final local region, and lighthouse attention compares against chunk summaries.

## How the Frontend Explains the Concept

The UI avoids low-level model jargon where possible:

- Tokens are described as words or pieces of text
- Chunks are sections of a long document
- Lighthouse tokens are summaries or guideposts
- Attention connections are explained as "who is allowed to look at whom"

The heatmap colors make the tradeoff visible:

- Dark cells: blocked
- Blue: local/full allowed attention
- Gold: normal tokens reading lighthouse summaries
- Green: lighthouse summaries reading their own chunks
- Pink: lighthouse summaries talking to other lighthouse summaries

The retrieval demo is the main narrative proof point. It shows a final query, the best full-attention evidence, whether sliding-window attention can reach it, and the chunk selected by lighthouse-style summaries.

## How to Run the App

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Docker:

```bash
docker-compose up --build
```

## Tests Run

Backend:

```bash
pytest
```

Result during validation: 28 tests passed.

Frontend:

```bash
npm run build
```

Result during validation: TypeScript and production Vite build passed.

## Known Limitations

- This is not a trained LLM.
- The embeddings are deterministic toy vectors, not semantic foundation-model embeddings.
- Chunk summaries are extractive and simple.
- Runtime estimates are based on edge counts, not measured GPU kernels.
- Lighthouse-style attention here is an educational approximation, not an exact paper implementation.

## Suggested Future Improvements

- Add optional real embedding models for local advanced mode.
- Add side-by-side measured CPU timing for small sequences.
- Add exportable screenshots for presentations.
- Add keyboard navigation inside heatmap cells.
- Add more curated examples across legal, medical, support, and engineering documents.
- Add a small guided tour overlay for first-time users.
