import { Compass, Network, Route } from "lucide-react";

import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";

const items = [
  {
    icon: Network,
    title: "Full Attention",
    badge: "Maximum reach",
    tone: "blue" as const,
    glowColor: "bg-sky-400/10",
    iconColor: "text-sky-200",
    dotColor: "bg-sky-400",
    points: [
      "Every token can look at every other token.",
      "Best reach across the whole document.",
      "Highest cost because connections grow as N².",
    ],
  },
  {
    icon: Route,
    title: "Sliding-Window Attention",
    badge: "Local only",
    tone: "green" as const,
    glowColor: "bg-emerald-400/10",
    iconColor: "text-emerald-200",
    dotColor: "bg-emerald-400",
    points: [
      "Tokens only look nearby.",
      "Much cheaper for long sequences.",
      "Distant information can disappear from view.",
    ],
  },
  {
    icon: Compass,
    title: "Lighthouse Attention",
    badge: "Guideposts",
    tone: "gold" as const,
    glowColor: "bg-amber-400/10",
    iconColor: "text-amber-200",
    dotColor: "bg-amber-400",
    points: [
      "Split text into chunks.",
      "Create summary guideposts for each chunk.",
      "Tokens look nearby plus lighthouse summaries.",
    ],
  },
];

export function ExplanationCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-200/70">Simple language</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Attention as visibility</h2>
        <p className="mt-3 text-slate-300">
          Tokens are words or pieces of text. Attention connections decide who is allowed to look
          at whom. Lighthouse tokens are summaries that act like guideposts across a long document.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item) => (
          <Card key={item.title} className="relative overflow-hidden">
            {/* Per-card ambient glow */}
            <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl ${item.glowColor}`} />
            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <item.icon className={`h-6 w-6 ${item.iconColor}`} aria-hidden="true" />
                </div>
                <Badge tone={item.tone}>{item.badge}</Badge>
              </div>
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                {item.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className={`mt-2 h-1.5 w-1.5 flex-none rounded-full ${item.dotColor}`} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
