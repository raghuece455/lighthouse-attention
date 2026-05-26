from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_returns_ok():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_examples_returns_at_least_three_examples():
    response = client.get("/api/examples")

    assert response.status_code == 200
    examples = response.json()
    assert len(examples) >= 3
    assert {"id", "title", "document", "query"}.issubset(examples[0])


def test_analyze_returns_expected_keys():
    example = client.get("/api/examples").json()[0]
    response = client.post(
        "/api/analyze",
        json={
            "document": example["document"],
            "query": example["query"],
            "window_size": 32,
            "chunk_size": 128,
            "embedding_dim": 64,
            "visualization_token_cap": 96,
        },
    )

    assert response.status_code == 200
    data = response.json()
    for key in [
        "token_count",
        "chunk_count",
        "edge_counts",
        "memory_estimates",
        "attention_patterns",
        "chunks",
        "retrieval",
    ]:
        assert key in data


def test_analyze_rejects_document_over_max_length():
    response = client.post(
        "/api/analyze",
        json={
            "document": "x" * 50_001,
            "query": "hello",
            "window_size": 32,
            "chunk_size": 128,
            "embedding_dim": 64,
            "visualization_token_cap": 96,
        },
    )
    assert response.status_code == 422


def test_analyze_rejects_empty_document():
    response = client.post(
        "/api/analyze",
        json={
            "document": "",
            "query": "hello",
            "window_size": 32,
            "chunk_size": 128,
            "embedding_dim": 64,
            "visualization_token_cap": 96,
        },
    )
    assert response.status_code == 422


def test_benchmark_rejects_too_many_lengths():
    response = client.post(
        "/api/benchmark",
        json={
            "lengths": list(range(100, 1400, 100)),  # 13 elements — over limit
            "window_size": 32,
            "chunk_size": 128,
        },
    )
    assert response.status_code == 422


def test_benchmark_returns_expected_shape():
    response = client.post(
        "/api/benchmark",
        json={"lengths": [256, 512, 1024], "window_size": 32, "chunk_size": 128},
    )
    assert response.status_code == 200
    data = response.json()
    assert "points" in data
    assert len(data["points"]) == 3
    for point in data["points"]:
        assert "edge_counts" in point
        assert "memory_estimates" in point
