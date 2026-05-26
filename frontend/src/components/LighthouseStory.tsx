import { motion } from "framer-motion";
import { ChevronRight, FileText, Landmark, MoveRight, Radar } from "lucide-react";

import { Card } from "./ui/Card";

const steps = [
  {
    icon: FileText,
    step: "01",
    title: "Split the document",
    body: "A long text is divided into chunks so each section can be summarised independently.",
    color: "text-sky-200",
    border: "border-sky-300/20",
    bg: "bg-sky-300/5",
  },
  {
    icon: Landmark,
    step: "02",
    title: "Build summary guideposts",
    body: "Each chunk creates one lighthouse token — like a chapter summary in a long book.",
    color: "text-violet-200",
    border: "border-violet-300/20",
    bg: "bg-violet-300/5",
  },
  {
    icon: Radar,
    step: "03",
    title: "Read nearby context",
    body: "Normal tokens keep a local sliding window for detailed nearby context.",
    color: "text-emerald-200",
    border: "border-emerald-300/20",
    bg: "bg-emerald-300/5",
  },
  {
    icon: MoveRight,
    step: "04",
    title: "Route to distant evidence",
    body: "When the query needs far-away evidence, lighthouse summaries provide a global path.",
    color: "text-amber-200",
    border: "border-amber-300/20",
    bg: "bg-amber-300/5",
  },
];

export function LighthouseStory() {
  return (
    <section id="story" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.25em] text-violet-200/70">Story mode</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">How the lighthouse path works</h2>
        <p className="mt-3 text-slate-300">
          Four steps that take a long document from raw tokens to globally-aware retrieval.
        </p>
      </div>

      <Card className="overflow-visible">
        {/* Step cards with arrow connectors between them */}
        <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-0">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-1 flex-col md:flex-row md:items-stretch">
              {/* Step card */}
              <motion.div
                className={`flex flex-1 flex-col rounded-2xl border p-5 ${step.border} ${step.bg}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
              >
                {/* Step number + icon */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <step.icon className={`h-5 w-5 ${step.color}`} aria-hidden="true" />
                  </div>
                  <span className={`font-mono text-2xl font-bold opacity-20 ${step.color}`}>
                    {step.step}
                  </span>
                </div>
                <h3 className="font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.body}</p>
              </motion.div>

              {/* Arrow connector between cards — desktop only */}
              {index < steps.length - 1 && (
                <div className="hidden shrink-0 items-center justify-center px-2 md:flex">
                  <ChevronRight className="h-5 w-5 text-slate-600" aria-hidden="true" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
