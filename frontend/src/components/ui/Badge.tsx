import type { ReactNode } from "react";

import { cx } from "./Card";

type BadgeProps = {
  children: ReactNode;
  tone?: "blue" | "gold" | "green" | "red" | "purple" | "slate";
  className?: string;
};

const tones = {
  blue: "border-sky-300/30 bg-sky-400/10 text-sky-200",
  gold: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  green: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
  red: "border-orange-300/30 bg-orange-400/10 text-orange-200",
  purple: "border-violet-300/30 bg-violet-400/10 text-violet-200",
  slate: "border-slate-500/40 bg-slate-800/70 text-slate-200",
};

export function Badge({ children, tone = "slate", className }: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
