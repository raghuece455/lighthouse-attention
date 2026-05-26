import type { ReactNode } from "react";
import { HelpCircle } from "lucide-react";

export function Tooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <HelpCircle className="h-4 w-4 text-slate-400" aria-hidden="true" />
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 opacity-0 shadow-xl transition group-hover:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

export function TooltipLabel({ children, text }: { children: ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {children}
      <Tooltip text={text} />
    </span>
  );
}
