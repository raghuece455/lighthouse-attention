import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { BenchmarkResponse } from "../lib/types";
import { formatCompact, formatMemory } from "../lib/format";
import { Card } from "./ui/Card";

function ChartFrame({ children }: { children: (width: number, height: number) => ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const height = 320;

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const update = () => setWidth(Math.floor(element.clientWidth));
    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-80 min-w-0">
      {width > 0 ? (
        children(width, height)
      ) : (
        <div className="flex h-full animate-pulse items-center justify-center rounded-xl bg-slate-900/40 text-sm text-slate-600">
          Preparing chart…
        </div>
      )}
    </div>
  );
}

export function BenchmarkChart({ benchmark }: { benchmark: BenchmarkResponse | null }) {
  const data = useMemo(
    () =>
      benchmark?.points.map((point) => ({
        length: point.length,
        full: point.edge_counts.full,
        sliding: point.edge_counts.sliding_window,
        lighthouse: point.edge_counts.lighthouse,
        fullMemory: point.memory_estimates.full_attention_mb_fp16,
        slidingMemory: point.memory_estimates.sliding_attention_mb_fp16,
        lighthouseMemory: point.memory_estimates.lighthouse_attention_mb_fp16,
      })) ?? [],
    [benchmark],
  );

  if (!benchmark) {
    return null;
  }

  return (
    <section id="benchmark" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-200/70">Scaling benchmark</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">What happens as N grows?</h2>
        <p className="mt-3 text-slate-300">
          As N grows, full attention grows quadratically. Lighthouse attention grows much slower
          because it adds only a small number of summary guideposts.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="min-w-0">
          <h3 className="mb-4 font-semibold text-white">Attention edge counts</h3>
          <ChartFrame>
            {(width, height) => (
              <LineChart
                width={width}
                height={height}
                data={data}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="length" stroke="#94a3b8" tickFormatter={formatCompact} />
                <YAxis
                  stroke="#94a3b8"
                  scale="log"
                  domain={["auto", "auto"]}
                  tickFormatter={formatCompact}
                />
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid rgba(148,163,184,0.3)",
                    borderRadius: "12px",
                  }}
                  formatter={(value) => formatCompact(Number(value))}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="full"
                  name="Full attention"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="sliding"
                  name="Sliding window"
                  stroke="#34d399"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="lighthouse"
                  name="Lighthouse"
                  stroke="#fbbf24"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            )}
          </ChartFrame>
        </Card>

        <Card className="min-w-0">
          <h3 className="mb-4 font-semibold text-white">Estimated fp16 attention memory</h3>
          <ChartFrame>
            {(width, height) => (
              <LineChart
                width={width}
                height={height}
                data={data}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="length" stroke="#94a3b8" tickFormatter={formatCompact} />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => formatMemory(Number(value))} />
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid rgba(148,163,184,0.3)",
                    borderRadius: "12px",
                  }}
                  formatter={(value) => formatMemory(Number(value))}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="fullMemory"
                  name="Full fp16"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="slidingMemory"
                  name="Sliding fp16"
                  stroke="#34d399"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="lighthouseMemory"
                  name="Lighthouse fp16"
                  stroke="#fbbf24"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            )}
          </ChartFrame>
        </Card>
      </div>
    </section>
  );
}
