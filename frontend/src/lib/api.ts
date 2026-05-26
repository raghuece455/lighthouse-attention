import type {
  AnalyzePayload,
  AnalyzeResponse,
  BenchmarkPayload,
  BenchmarkResponse,
  ExampleDocument,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => undefined);
      throw new Error(payload?.detail ?? `Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Backend is not running. Start it with uvicorn app.main:app --reload --port 8000.",
      );
    }
    throw error;
  }
}

export function getExamples(): Promise<ExampleDocument[]> {
  return request<ExampleDocument[]>("/api/examples");
}

export function analyze(payload: AnalyzePayload): Promise<AnalyzeResponse> {
  return request<AnalyzeResponse>("/api/analyze", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function benchmark(payload: BenchmarkPayload): Promise<BenchmarkResponse> {
  return request<BenchmarkResponse>("/api/benchmark", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
