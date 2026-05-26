from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.analysis import analyze_document
from app.benchmark import run_benchmark
from app.examples import get_examples
from app.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    BenchmarkRequest,
    BenchmarkResponse,
    ExampleDocument,
    HealthResponse,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def _lifespan(application: FastAPI) -> AsyncIterator[None]:  # noqa: ARG001
    logger.info("Lighthouse Attention Lab API started.")
    yield


app = FastAPI(
    title="Lighthouse Attention Lab API",
    description="Educational Lighthouse-style Attention simulator with deterministic computed metrics.",
    version="1.0.0",
    lifespan=_lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
def health() -> dict[str, str]:
    return {"status": "ok", "service": "lighthouse-attention-lab"}


@app.get("/api/examples", response_model=list[ExampleDocument])
def examples() -> list[dict[str, str]]:
    return get_examples()


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> dict[str, object]:
    logger.info(
        "analyze: doc_chars=%d query_chars=%d window=%d chunk=%d dim=%d",
        len(request.document),
        len(request.query),
        request.window_size,
        request.chunk_size,
        request.embedding_dim,
    )
    try:
        return analyze_document(request)
    except ValueError as exc:
        logger.warning("analyze rejected: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/benchmark", response_model=BenchmarkResponse)
def benchmark(request: BenchmarkRequest) -> dict[str, object]:
    logger.info(
        "benchmark: lengths=%s window=%d chunk=%d",
        request.lengths,
        request.window_size,
        request.chunk_size,
    )
    try:
        return run_benchmark(request.lengths, request.window_size, request.chunk_size)
    except ValueError as exc:
        logger.warning("benchmark rejected: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
