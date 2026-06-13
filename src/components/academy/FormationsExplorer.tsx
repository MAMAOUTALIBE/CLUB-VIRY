"use client";

import { useState } from "react";
import { ArrowUpRight, Target } from "lucide-react";
import { THEMES, type ThemeKey } from "@/lib/academy-data";
import { AcademyCta } from "@/components/academy/AcademyCta";

// Catalogue interactif premium : chips de filtre systématisées (.ac-chip) +
// cartes au langage unifié (.ac-frame + liseré thématique + coins dorés au survol).
// Rendu côté serveur (SSR) puis hydraté : contenu dans le HTML initial (SEO OK).

const CARD_BTN =
  "focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#002f1d] px-4 py-3 text-sm font-black uppercase tracking-[0.04em] text-white shadow-[0_8px_20px_-12px_rgba(0,31,19,0.5)] transition hover:-translate-y-0.5 hover:bg-[#07542f]";

type Filter = ThemeKey | "all";

export function FormationsExplorer({ academyUrl }: { academyUrl?: string }) {
  const [active, setActive] = useState<Filter>("all");

  const chips: Array<{ key: Filter; label: string; count: number }> = [
    { key: "all", label: "Tout", count: THEMES.reduce((sum, theme) => sum + theme.formations.length, 0) },
    ...THEMES.map((theme) => ({ key: theme.key as Filter, label: theme.label, count: theme.formations.length }))
  ];

  const visibleThemes = active === "all" ? THEMES : THEMES.filter((theme) => theme.key === active);

  return (
    <div>
      {/* Chips de filtre */}
      <div
        className="mb-10 flex gap-2.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [mask-image:linear-gradient(90deg,#000_92%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label="Filtrer les formations par univers"
      >
        {chips.map((chip) => {
          const isActive = active === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              aria-pressed={isActive}
              data-active={isActive}
              onClick={() => setActive(chip.key)}
              className="ac-chip focus-ring inline-flex min-h-[42px] shrink-0 items-center px-4 py-2 text-sm"
            >
              {chip.label} <span className={isActive ? "ml-1 opacity-60" : "ml-1 opacity-50"}>({chip.count})</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-12">
        {visibleThemes.map((theme) => (
          <div key={theme.key}>
            <div className="mb-6">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-1 rounded-full" style={{ background: theme.accent }} aria-hidden="true" />
                  <h3 className="text-xl font-black uppercase tracking-[0.03em] text-white">{theme.label}</h3>
                </div>
                <p className="text-sm font-semibold italic text-white/75">{theme.tagline}</p>
              </div>
              <div className="ac-rule-gold mt-4 opacity-60" aria-hidden="true" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {theme.formations.map((formation) => {
                const Icon = formation.icon;
                const styleVars = { "--ac-accent": theme.accent } as React.CSSProperties;
                return (
                  <article key={formation.title} style={styleVars} className="ac-frame ac-corner group relative flex flex-col p-6 text-[#002f1d]">
                    <span className="ac-accent-bar" aria-hidden="true" />
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border transition group-hover:scale-110"
                      style={{ background: `${theme.accent}1a`, color: theme.accentText, borderColor: `${theme.accent}33` }}
                      aria-hidden="true"
                    >
                      <Icon size={24} />
                    </span>
                    <h4 className="mt-4 text-[1.0625rem] font-black uppercase leading-tight tracking-[-0.005em]">{formation.title}</h4>
                    <p className="mt-2 flex-1 text-sm leading-7 text-slate-600">{formation.description}</p>
                    <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Target size={14} style={{ color: theme.accentText }} aria-hidden="true" /> {formation.outcome}
                    </p>
                    <span className="mt-3 w-fit rounded-full px-3 py-1 text-[11px] font-black uppercase" style={{ background: `${theme.accent}1a`, color: theme.accentText }}>
                      {formation.audience}
                    </span>
                    <AcademyCta url={academyUrl} className={CARD_BTN}>
                      Je découvre <ArrowUpRight size={16} aria-hidden="true" />
                    </AcademyCta>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
