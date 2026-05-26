import { AlertTriangle, CheckCircle2, Compass, Search } from "lucide-react";

import type { RetrievalResult } from "../lib/types";
import { formatScore } from "../lib/format";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";

export function RetrievalDemo({ retrieval }: { retrieval: RetrievalResult }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.25em] text-amber-200/70">Retrieval test</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">
          Can the final query find far-away evidence?
        </h2>
        <p className="mt-3 max-w-3xl text-slate-300">
          The query is treated like it appears at the end of the document. Full attention can search
          everywhere, sliding-window can only search nearby tokens, and lighthouse attention can scan
          chunk summaries.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-2xl border border-sky-300/20 bg-sky-300/10 p-3">
              <Search className="h-5 w-5 text-sky-200" aria-hidden="true" />
            </div>
            <Badge tone="blue">Score {formatScore(retrieval.full_attention.score)}</Badge>
          </div>
          <h3 className="text-xl font-semibold text-white">Full Attention</h3>
          <p className="mt-2 text-sm text-slate-400">Best evidence found anywhere in document.</p>
          <p className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-200">
            {retrieval.full_attention.snippet}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Top token index: {retrieval.full_attention.top_token_index}
          </p>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3">
              {retrieval.sliding_window.can_reach_best_token ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-200" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-200" aria-hidden="true" />
              )}
            </div>
            <Badge tone={retrieval.sliding_window.can_reach_best_token ? "green" : "red"}>
              {retrieval.sliding_window.can_reach_best_token
                ? "Evidence reachable"
                : "Far-away evidence blocked"}
            </Badge>
          </div>
          <h3 className="text-xl font-semibold text-white">Sliding Window</h3>
          <p className="mt-2 text-sm text-slate-400">Only searches the final local neighborhood.</p>
          <p className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-200">
            {retrieval.sliding_window.snippet}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Best reachable score: {formatScore(retrieval.sliding_window.best_reachable_score)}
          </p>
        </Card>

        <Card glow>
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3">
              <Compass className="h-5 w-5 text-amber-200" aria-hidden="true" />
            </div>
            <Badge tone="gold">Chunk {retrieval.lighthouse_attention.top_chunk_id + 1}</Badge>
          </div>
          <h3 className="text-xl font-semibold text-white">Lighthouse Attention</h3>
          <p className="mt-2 text-sm text-slate-400">Searches chunk summaries as global guideposts.</p>
          <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-50">
            {retrieval.lighthouse_attention.summary}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {retrieval.lighthouse_attention.top_keywords.map((keyword) => (
              <Badge key={keyword} tone="gold">
                {keyword}
              </Badge>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Summary score: {formatScore(retrieval.lighthouse_attention.score)}
          </p>
        </Card>
      </div>

      <Card className="mt-5 border-amber-300/20 bg-amber-300/5">
        <p className="text-base text-amber-50">{retrieval.plain_english_takeaway}</p>
      </Card>
    </section>
  );
}
