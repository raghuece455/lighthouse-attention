import { Landmark } from "lucide-react";

import type { ChunkInfo } from "../lib/types";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";

export function DocumentExplorer({
  chunks,
  selectedChunkId,
}: {
  chunks: ChunkInfo[];
  selectedChunkId: number;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-200/70">Chunk explorer</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">The document becomes guideposts</h2>
        <p className="mt-3 text-slate-300">
          Each chunk gets a compact extractive summary and keywords. The highlighted chunk is the
          lighthouse summary selected by the query.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {chunks.map((chunk) => {
          const selected = chunk.chunk_id === selectedChunkId;
          return (
            <Card key={chunk.chunk_id} glow={selected} className="relative">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-2.5">
                    <Landmark className="h-5 w-5 text-amber-200" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Chunk {chunk.chunk_id + 1}</h3>
                    <p className="text-xs text-slate-500">
                      Tokens {chunk.start_token}-{chunk.end_token}
                    </p>
                  </div>
                </div>
                {selected && <Badge tone="gold">Selected</Badge>}
              </div>
              <p className="text-sm text-slate-300">{chunk.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {chunk.top_keywords.map((keyword) => (
                  <Badge key={keyword} tone={selected ? "gold" : "slate"}>
                    {keyword}
                  </Badge>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
