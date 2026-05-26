import type { HTMLAttributes, ReactNode } from "react";

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  glow?: boolean;
};

export function Card({ children, className, glow = false, ...props }: CardProps) {
  return (
    <div
      className={cx(
        "glass rounded-2xl p-5 transition duration-300",
        glow && "shadow-beacon ring-1 ring-amber-300/30",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
