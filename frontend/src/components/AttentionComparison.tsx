import type { AnalyzeResponse } from "../lib/types";
import { AttentionHeatmap } from "./AttentionHeatmap";

export function AttentionComparison({ analysis }: { analysis: AnalyzeResponse }) {
  const patterns = analysis.attention_patterns;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-200/70">Attention masks</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Who can look at whom?</h2>
        <p className="mt-3 text-slate-300">
          Rows are query tokens. Columns are key/value tokens. Bright cells are allowed
          connections. The lighthouse view adds extra rows and columns for summary guideposts.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <AttentionHeatmap
          title="Full Attention"
          matrix={patterns.full}
          tokenCount={patterns.visual_token_count}
          caption="The whole square is lit: every token can read every token."
        />
        <AttentionHeatmap
          title="Sliding Window"
          matrix={patterns.sliding}
          tokenCount={patterns.visual_token_count}
          caption="A diagonal band: each token sees nearby context only."
        />
        <AttentionHeatmap
          title="Lighthouse Attention"
          matrix={patterns.lighthouse}
          tokenCount={patterns.visual_token_count}
          lighthouseCount={patterns.visual_lighthouse_count}
          caption="Local band plus global summary tokens for chunk-level routing."
        />
      </div>
    </section>
  );
}
