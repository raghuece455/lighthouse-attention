import { ExternalLink, Github } from "lucide-react";

import { Badge } from "./ui/Badge";

const DOC_LINKS = [
  { label: "Concepts",     href: "https://github.com/raghuece455/lighthouse-attention/blob/main/docs/CONCEPTS.md" },
  { label: "Architecture", href: "https://github.com/raghuece455/lighthouse-attention/blob/main/docs/ARCHITECTURE.md" },
  { label: "API Reference",href: "https://github.com/raghuece455/lighthouse-attention/blob/main/docs/API.md" },
  { label: "Setup Guide",  href: "https://github.com/raghuece455/lighthouse-attention/blob/main/SETUP.md" },
] as const;

export function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <p className="font-semibold text-white">Lighthouse Attention Lab</p>
            <p className="mt-1 text-sm text-slate-400">
              Educational approximation. No external model downloads. All metrics are computed
              locally from your selected text.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="blue">FastAPI</Badge>
              <Badge tone="purple">React 19</Badge>
              <Badge tone="gold">Deterministic embeddings</Badge>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-10">
            {/* Docs */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Docs
              </p>
              <ul className="space-y-2">
                {DOC_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-sky-300"
                    >
                      {link.label}
                      <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Project */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Project
              </p>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://github.com/raghuece455/lighthouse-attention"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-sky-300"
                  >
                    <Github className="h-4 w-4" aria-hidden="true" />
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="http://localhost:8000/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-sky-300"
                  >
                    API Explorer
                    <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/raghuece455/lighthouse-attention/blob/main/CONTRIBUTING.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-sky-300"
                  >
                    Contributing
                    <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-700/50 pt-4 text-xs text-slate-600">
          MIT License · © 2025 Raghunath Juluri · Not an exact implementation of any research paper
        </div>
      </div>
    </footer>
  );
}
