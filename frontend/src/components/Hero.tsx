import { motion } from "framer-motion";
import { ArrowDown, Globe2, Network, ScanSearch } from "lucide-react";

import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

const cards = [
  {
    icon: Network,
    title: "Full Attention",
    body: "Everyone talks to everyone",
    color: "text-sky-200",
    hoverGlow: "from-sky-400/15",
    numberColor: "text-sky-700/60",
  },
  {
    icon: ScanSearch,
    title: "Sliding Window",
    body: "Only nearby neighbors",
    color: "text-emerald-200",
    hoverGlow: "from-emerald-400/15",
    numberColor: "text-emerald-700/60",
  },
  {
    icon: Globe2,
    title: "Lighthouse",
    body: "Local context + global guideposts",
    color: "text-amber-200",
    hoverGlow: "from-amber-400/15",
    numberColor: "text-amber-700/60",
  },
];

export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 beam-grid opacity-60" aria-hidden="true" />
      <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-5 inline-flex rounded-full border border-sky-300/25 bg-sky-300/10 px-4 py-2 text-sm text-sky-100">
              Educational Lighthouse-style Attention simulator
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Lighthouse Attention Lab
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl">
              See how long-context AI can keep global awareness without every token looking at every
              other token.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() =>
                  document.getElementById("lab")?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                Run live demo
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  document.getElementById("story")?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                Watch the concept
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            {cards.map((card, index) => (
              <Card key={card.title} className="group relative overflow-hidden">
                {/* Per-type hover glow */}
                <div
                  className={`absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l ${card.hoverGlow} to-transparent opacity-0 transition group-hover:opacity-100`}
                />
                <div className="relative flex items-center gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <card.icon className={`h-7 w-7 ${card.color}`} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{card.title}</h3>
                    <p className="text-sm text-slate-300">{card.body}</p>
                  </div>
                  <span className={`ml-auto font-mono text-sm ${card.numberColor}`}>
                    0{index + 1}
                  </span>
                </div>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
