import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { analyze, benchmark, getExamples } from "./lib/api";
import type { AnalyzeResponse, BenchmarkResponse, ExampleDocument } from "./lib/types";
import { AttentionComparison } from "./components/AttentionComparison";
import { BenchmarkChart } from "./components/BenchmarkChart";
import { ControlPanel, type ControlValues } from "./components/ControlPanel";
import { DocumentExplorer } from "./components/DocumentExplorer";
import { ExplanationCards } from "./components/ExplanationCards";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { LighthouseStory } from "./components/LighthouseStory";
import { MetricsGrid } from "./components/MetricsGrid";
import { RetrievalDemo } from "./components/RetrievalDemo";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";

const defaultControls: ControlValues = {
  windowSize: 32,
  chunkSize: 128,
  embeddingDim: 64,
  visualizationTokenCap: 160,
};

function LoadingPanel() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-sky-300" aria-hidden="true" />
        <h2 className="mt-5 text-2xl font-semibold text-white">Computing attention paths...</h2>
        <p className="mt-2 max-w-xl text-slate-400">
          The backend is tokenizing your document, building masks, estimating memory, creating
          summaries, and running the retrieval simulation.
        </p>
      </Card>
    </section>
  );
}

function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Card className="border-orange-300/30 bg-orange-500/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <AlertCircle className="mt-1 h-5 w-5 flex-none text-orange-200" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-orange-100">Something needs attention</h2>
              <p className="mt-1 text-sm text-orange-100/80">{message}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      </Card>
    </section>
  );
}

function App() {
  const [examples, setExamples] = useState<ExampleDocument[]>([]);
  const [selectedExampleId, setSelectedExampleId] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [query, setQuery] = useState("");
  const [controls, setControls] = useState<ControlValues>(defaultControls);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedExample = useMemo(
    () => examples.find((example) => example.id === selectedExampleId),
    [examples, selectedExampleId],
  );

  const runAnalysis = useCallback(
    async (documentOverride?: string, queryOverride?: string) => {
      const activeDocument = documentOverride ?? documentText;
      const activeQuery = queryOverride ?? query;
      if (!activeDocument.trim() || !activeQuery.trim()) {
        setError("Add a document and query before running analysis.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await analyze({
          document: activeDocument,
          query: activeQuery,
          window_size: controls.windowSize,
          chunk_size: controls.chunkSize,
          embedding_dim: controls.embeddingDim,
          visualization_token_cap: controls.visualizationTokenCap,
        });
        setAnalysis(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed.");
      } finally {
        setLoading(false);
        setInitializing(false);
      }
    },
    [controls, documentText, query],
  );

  const runBenchmark = useCallback(async (activeControls = controls) => {
    try {
      const result = await benchmark({
        lengths: [256, 512, 1024, 2048, 4096, 8192],
        window_size: activeControls.windowSize,
        chunk_size: activeControls.chunkSize,
      });
      setBenchmarkData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Benchmark failed.");
    }
  }, [controls]);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        const loadedExamples = await getExamples();
        if (!mounted) {
          return;
        }

        setExamples(loadedExamples);
        const first = loadedExamples[0];
        if (first) {
          setSelectedExampleId(first.id);
          setDocumentText(first.document);
          setQuery(first.query);
          await runBenchmark(defaultControls);
          await runAnalysis(first.document, first.query);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Could not load examples.");
          setInitializing(false);
        }
      }
    }

    boot();
    return () => {
      mounted = false;
    };
  }, []);

  function handleExampleChange(id: string) {
    const next = examples.find((example) => example.id === id);
    setSelectedExampleId(id);
    if (next) {
      setDocumentText(next.document);
      setQuery(next.query);
    }
  }

  const handleRun = useCallback(async () => {
    await Promise.all([runAnalysis(), runBenchmark()]);
  }, [runAnalysis, runBenchmark]);

  function handleControlChange(patch: Partial<ControlValues>) {
    setControls((current) => ({ ...current, ...patch }));
  }

  return (
    <>
    <Header />
    <main className="min-h-screen overflow-hidden bg-radial-beam text-slate-100">
      <Hero />
      <ExplanationCards />

      <ControlPanel
        examples={examples}
        selectedExampleId={selectedExampleId}
        document={documentText}
        query={query}
        controls={controls}
        loading={loading}
        onExampleChange={handleExampleChange}
        onDocumentChange={setDocumentText}
        onQueryChange={setQuery}
        onControlChange={handleControlChange}
        onRun={handleRun}
      />

      {selectedExample && (
        <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          <Card className="border-sky-300/20 bg-sky-300/5">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-sky-100">Example hint:</span>{" "}
              {selectedExample.hidden_fact_position_hint}
            </p>
          </Card>
        </section>
      )}

      {error && <ErrorPanel message={error} onRetry={handleRun} />}
      {loading || initializing ? <LoadingPanel /> : null}

      {analysis && !loading && (
        <>
          <MetricsGrid analysis={analysis} />
          <AttentionComparison analysis={analysis} />
          <RetrievalDemo retrieval={analysis.retrieval} />
          <DocumentExplorer
            chunks={analysis.chunks}
            selectedChunkId={analysis.retrieval.lighthouse_attention.top_chunk_id}
          />
        </>
      )}

      <LighthouseStory />
      <BenchmarkChart benchmark={benchmarkData} />
      <Footer />
    </main>
    </>
  );
}

export default App;
