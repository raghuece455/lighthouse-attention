import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cx } from "./Card";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary"
          ? "bg-gradient-to-r from-sky-400 via-violet-400 to-amber-300 text-slate-950 shadow-glow hover:scale-[1.02]"
          : "border border-slate-600/70 bg-slate-900/60 text-slate-100 hover:border-sky-300/60 hover:bg-slate-800/80",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
