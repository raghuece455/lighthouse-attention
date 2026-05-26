import { useMemo } from "react";
import { Play, RotateCcw } from "lucide-react";

import type { ExampleDocument } from "../lib/types";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Slider } from "./ui/Slider";

export type ControlValues = {
  windowSize: number;
  chunkSize: number;
  embeddingDim: number;
  visualizationTokenCap: number;
};

type Props = {
  examples: ExampleDocument[];
  selectedExampleId: string;
  document: string;
  query: string;
  controls: ControlValues;
  loading: boolean;
  onExampleChange: (id: string) => void;
  onDocumentChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onControlChange: (patch: Partial<ControlValues>) => void;
  onRun: () => void;
};

export function ControlPanel({
  examples,
  selectedExampleId,
  document,
  query,
  controls,
  loading,
  onExampleChange,
  onDocumentChange,
  onQueryChange,
  onControlChange,
  onRun,
}: Props) {
  // Client-side token estimate (regex mirrors backend TOKEN_PATTERN; good enough for a live hint)
  const tokenEstimate = useMemo(() => {
    if (!document.trim()) return 0;
    const matches = document.match(/[A-Za-z]+(?:[-'][A-Za-z]+)?|\d+(?:\.\d+)?|[^\w\s]/g);
    return matches?.length ?? 0;
  }, [document]);

  const chunkEstimate = tokenEstimate > 0 ? Math.ceil(tokenEstimate / controls.chunkSize) : 0;

  return (
    <section id="lab" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-amber-200/70">Interactive lab</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Run the simulator on real text</h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            Choose an example or paste your own long document. The backend computes tokens, chunks,
            attention edges, memory estimates, masks, summaries, and retrieval scores from the
            selected content.
          </p>
        </div>
        <Button disabled={loading || !document.trim() || !query.trim()} onClick={onRun}>
          {loading ? "Analyzing…" : "Run Analysis"}
          <Play className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Document input */}
        <Card>
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Example document
              </span>
              <select
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-300"
                value={selectedExampleId}
                onChange={(event) => onExampleChange(event.target.value)}
              >
                {examples.map((example) => (
                  <option key={example.id} value={example.id}>
                    {example.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Document</span>
              <textarea
                className="min-h-80 w-full resize-y rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-300"
                value={document}
                onChange={(event) => onDocumentChange(event.target.value)}
                placeholder="Paste a long document here…"
              />
              {/* Live token estimate */}
              {tokenEstimate > 0 && (
                <p className="mt-1.5 text-xs text-slate-500">
                  ~{tokenEstimate.toLocaleString()} tokens
                  {chunkEstimate > 0 && (
                    <>
                      {" · "}
                      <span className="text-amber-400/70">
                        {chunkEstimate} chunk{chunkEstimate !== 1 ? "s" : ""} at chunk size{" "}
                        {controls.chunkSize}
                      </span>
                    </>
                  )}
                </p>
              )}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Final query</span>
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-300"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Ask what the final token needs to find…"
              />
            </label>
          </div>
        </Card>

        {/* Controls */}
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Simulation controls</h3>
              <p className="text-sm text-slate-400">Adjust the attention tradeoff.</p>
            </div>
            <button
              className="rounded-full border border-slate-700 p-2 text-slate-300 transition hover:border-sky-300 hover:text-sky-100"
              type="button"
              onClick={() =>
                onControlChange({
                  windowSize: 32,
                  chunkSize: 128,
                  embeddingDim: 64,
                  visualizationTokenCap: 160,
                })
              }
              aria-label="Reset controls to defaults"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-6">
            <Slider
              label="Window size"
              min={4}
              max={128}
              step={4}
              value={controls.windowSize}
              tooltip="How many nearby tokens each token can read on either side."
              onChange={(windowSize) => onControlChange({ windowSize })}
            />
            <Slider
              label="Chunk size"
              min={32}
              max={512}
              step={32}
              value={controls.chunkSize}
              tooltip="How many tokens each lighthouse summary represents."
              onChange={(chunkSize) => onControlChange({ chunkSize })}
            />
            <Slider
              label="Embedding dim"
              min={16}
              max={128}
              step={16}
              value={controls.embeddingDim}
              tooltip="Size of the deterministic toy text vectors used for similarity."
              onChange={(embeddingDim) => onControlChange({ embeddingDim })}
            />
            <Slider
              label="Visualization token cap"
              min={64}
              max={256}
              step={32}
              value={controls.visualizationTokenCap}
              tooltip="Maximum number of normal tokens drawn in the heatmap."
              onChange={(visualizationTokenCap) => onControlChange({ visualizationTokenCap })}
            />
          </div>
        </Card>
      </div>
    </section>
  );
}
