import { useMemo } from "react";
import { Cpu, Gauge, HardDrive, Hash, Layers, Network, Waves, Zap } from "lucide-react";

import type { AnalyzeResponse } from "../lib/types";
import { formatInteger, formatMemory, formatPercent } from "../lib/format";
import { Card } from "./ui/Card";

type Metric = {
  label: string;
  value: string;
  detail: string;
  icon: typeof Network;
  iconColor: string;
};

export function MetricsGrid({ analysis }: { analysis: AnalyzeResponse }) {
  const countMetrics = useMemo<Metric[]>(
    () => [
      {
        label: "Tokens",
        value: formatInteger(analysis.token_count),
        detail: "words or text pieces",
        icon: Hash,
        iconColor: "text-sky-200",
      },
      {
        label: "Chunks",
        value: formatInteger(analysis.chunk_count),
        detail: "document sections",
        icon: Layers,
        iconColor: "text-sky-200",
      },
      {
        label: "Lighthouse tokens",
        value: formatInteger(analysis.lighthouse_token_count),
        detail: "summary guideposts",
        icon: Waves,
        iconColor: "text-amber-200",
      },
      {
        label: "Full edges",
        value: formatInteger(analysis.edge_counts.full),
        detail: "N² — everyone to everyone",
        icon: Network,
        iconColor: "text-sky-200",
      },
      {
        label: "Sliding edges",
        value: formatInteger(analysis.edge_counts.sliding_window),
        detail: `${formatPercent(analysis.reductions.sliding_vs_full_percent)} fewer than full`,
        icon: Gauge,
        iconColor: "text-emerald-200",
      },
      {
        label: "Lighthouse edges",
        value: formatInteger(analysis.edge_counts.lighthouse),
        detail: `${formatPercent(analysis.reductions.lighthouse_vs_full_percent)} fewer than full`,
        icon: Zap,
        iconColor: "text-amber-200",
      },
    ],
    [analysis],
  );

  const memoryMetrics = useMemo<Metric[]>(
    () => [
      {
        label: "Full attention — fp16",
        value: formatMemory(analysis.memory_estimates.full_attention_mb_fp16),
        detail: "attention weight memory",
        icon: HardDrive,
        iconColor: "text-sky-200",
      },
      {
        label: "Lighthouse — fp16",
        value: formatMemory(analysis.memory_estimates.lighthouse_attention_mb_fp16),
        detail: "attention weight memory",
        icon: Cpu,
        iconColor: "text-amber-200",
      },
    ],
    [analysis],
  );

  return (
    <section id="results" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Edge / token counts */}
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-500">
        Token &amp; edge counts
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {countMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      {/* Memory */}
      <p className="mb-3 mt-6 text-xs font-medium uppercase tracking-widest text-slate-500">
        Attention weight memory (fp16)
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {memoryMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
    </section>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <Card className="group overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{metric.value}</p>
          <p className="mt-1 text-xs text-slate-500">{metric.detail}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 transition group-hover:border-sky-300/40">
          <metric.icon className={`h-5 w-5 ${metric.iconColor}`} aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}
