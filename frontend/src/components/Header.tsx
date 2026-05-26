import { useEffect, useState } from "react";
import { ExternalLink, Waves } from "lucide-react";

const NAV_LINKS = [
  { label: "Lab",       id: "lab"       },
  { label: "Results",   id: "results"   },
  { label: "Story",     id: "story"     },
  { label: "Benchmark", id: "benchmark" },
] as const;

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-slate-700/50 shadow-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          className="flex items-center gap-2 rounded-full px-2 py-1 transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-sky-300"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          <Waves className="h-5 w-5 text-amber-300" aria-hidden="true" />
          <span className="hidden font-semibold text-white sm:inline">
            Lighthouse<span className="text-sky-300"> Attention</span>
          </span>
        </button>

        {/* Section nav */}
        <nav className="flex items-center gap-0.5" aria-label="Page sections">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="rounded-full px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-300"
            >
              {link.label}
            </button>
          ))}

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-1 rounded-full border border-sky-300/30 bg-sky-300/10 px-3 py-1.5 text-xs font-medium text-sky-200 transition hover:bg-sky-300/20 focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            API
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  );
}
