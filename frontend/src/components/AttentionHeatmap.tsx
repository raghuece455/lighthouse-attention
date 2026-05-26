import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";

const colors: Record<number, string> = {
  0: "#0b1020",
  1: "#38bdf8",
  2: "#fbbf24",
  3: "#34d399",
  4: "#f472b6",
};

const labels: Record<number, string> = {
  0: "Blocked",
  1: "Local/full attention",
  2: "Lighthouse access",
  3: "Lighthouse reads chunk",
  4: "Lighthouse network",
};

type Hover = {
  row: number;
  col: number;
  code: number;
  x: number;
  y: number;
};

type Props = {
  title: string;
  matrix: number[][];
  tokenCount: number;
  lighthouseCount?: number;
  caption: string;
};

export function AttentionHeatmap({
  title,
  matrix,
  tokenCount,
  lighthouseCount = 0,
  caption,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const size = matrix.length;

  const uniqueCodes = useMemo(() => {
    const codes = new Set<number>();
    matrix.forEach((row) => row.forEach((code) => codes.add(code)));
    return Array.from(codes).sort();
  }, [matrix]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper || !size) {
      return;
    }

    const draw = () => {
      const cssWidth = wrapper.clientWidth;
      const cssHeight = Math.min(360, Math.max(240, cssWidth * 0.72));
      const ratio = window.devicePixelRatio || 1;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      canvas.width = Math.floor(cssWidth * ratio);
      canvas.height = Math.floor(cssHeight * ratio);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.fillStyle = "#070b14";
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      const cellWidth = cssWidth / size;
      const cellHeight = cssHeight / size;

      for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
          ctx.fillStyle = colors[matrix[row][col]] ?? colors[0];
          ctx.fillRect(col * cellWidth, row * cellHeight, Math.ceil(cellWidth), Math.ceil(cellHeight));
        }
      }

      if (lighthouseCount > 0) {
        const boundaryX = tokenCount * cellWidth;
        const boundaryY = tokenCount * cellHeight;
        ctx.strokeStyle = "rgba(255,255,255,0.86)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(boundaryX, 0);
        ctx.lineTo(boundaryX, cssHeight);
        ctx.moveTo(0, boundaryY);
        ctx.lineTo(cssWidth, boundaryY);
        ctx.stroke();
      }
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [matrix, lighthouseCount, size, tokenCount]);

  function handleMove(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !size) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.min(size - 1, Math.max(0, Math.floor((x / rect.width) * size)));
    const row = Math.min(size - 1, Math.max(0, Math.floor((y / rect.height) * size)));
    setHover({ row, col, code: matrix[row][col], x, y });
  }

  return (
    <Card className="relative h-full">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{caption}</p>
        </div>
        <Badge tone={lighthouseCount ? "gold" : "blue"}>{size} x {size}</Badge>
      </div>

      {lighthouseCount > 0 && (
        <div className="mb-2 flex justify-between text-[11px] uppercase tracking-wide text-slate-500">
          <span>Normal tokens</span>
          <span>{lighthouseCount} lighthouse tokens</span>
        </div>
      )}

      <div ref={wrapperRef} className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
        <canvas
          ref={canvasRef}
          className="block cursor-crosshair"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
          role="img"
          aria-label={`${title} attention heatmap`}
          tabIndex={0}
        />
        {hover && (
          <div
            className="pointer-events-none absolute z-10 rounded-xl border border-slate-700 bg-slate-950/95 px-3 py-2 text-xs text-slate-100 shadow-xl"
            style={{
              left: Math.min(hover.x + 12, 260),
              top: Math.max(8, hover.y - 12),
            }}
          >
            <div>Query position: {hover.row}</div>
            <div>Key/value position: {hover.col}</div>
            <div className="font-medium text-sky-200">{labels[hover.code]}</div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {uniqueCodes.map((code) => (
          <span key={code} className="inline-flex items-center gap-2 text-xs text-slate-300">
            <span
              className="h-3 w-3 rounded-sm border border-white/10"
              style={{ background: colors[code] }}
            />
            {labels[code]}
          </span>
        ))}
      </div>
    </Card>
  );
}
