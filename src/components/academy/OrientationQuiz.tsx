"use client";

import { useState } from "react";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { QUIZ, THEMES, type ThemeKey } from "@/lib/academy-data";
import { AcademyCta } from "@/components/academy/AcademyCta";

// Quiz d'orientation premium : panneau au langage unifié (.ac-frame), bouton or
// signature, options raffinées. Outil du site du club (aucune donnée envoyée).

const PRIMARY_BTN =
  "ac-btn-gold focus-ring inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-black uppercase tracking-[0.04em] transition hover:-translate-y-0.5";
const GHOST_BTN =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-[#002f1d]/20 px-6 py-3 text-sm font-black uppercase text-[#002f1d] transition hover:border-[#07542f] hover:text-[#07542f]";

function emptyScores(): Record<ThemeKey, number> {
  return { sport: 0, scolaire: 0, pro: 0, numerique: 0 };
}

export function OrientationQuiz({ academyUrl }: { academyUrl?: string }) {
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<Record<ThemeKey, number>>(emptyScores);
  const [done, setDone] = useState(false);

  const total = QUIZ.length;
  const current = QUIZ[index];
  const progress = done ? 100 : Math.round((index / total) * 100);

  function answer(theme: ThemeKey) {
    const next = { ...scores, [theme]: scores[theme] + 1 };
    setScores(next);
    if (index + 1 < total) {
      setIndex(index + 1);
    } else {
      setDone(true);
    }
  }

  function reset() {
    setScores(emptyScores());
    setIndex(0);
    setDone(false);
  }

  // Univers gagnant (premier en cas d'égalité, ordre de THEMES).
  const winnerKey = (Object.keys(scores) as ThemeKey[]).reduce((best, key) => (scores[key] > scores[best] ? key : best), "sport" as ThemeKey);
  const winner = THEMES.find((theme) => theme.key === winnerKey) ?? THEMES[0];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="ac-frame ac-corner overflow-hidden">
        {/* Barre de progression */}
        <div className="h-1 w-full bg-[#002f1d]/10">
          <div className="h-full rounded-r-full bg-gradient-to-r from-[#ffd84d] to-[#f7c600] transition-all duration-300" style={{ width: `${progress}%` }} aria-hidden="true" />
        </div>

        {!done ? (
          <div className="p-8 sm:p-12">
            <p className="ac-eyebrow-dot text-xs font-black uppercase tracking-[0.18em] text-[#8a6d00]">
              Question {index + 1} / {total}
            </p>
            <h3 className="mt-3 text-[1.75rem] font-black uppercase leading-[1.15] tracking-[-0.01em] text-[#002f1d]">{current.question}</h3>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {current.options.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => answer(option.theme)}
                  className="focus-ring group flex items-center justify-between gap-3 rounded-2xl border border-[#002f1d]/12 bg-gradient-to-b from-white to-[#fcfdfb] px-5 py-4 text-left text-sm font-bold text-[#002f1d] transition hover:-translate-y-0.5 hover:border-[#f7c600] hover:shadow-[0_12px_26px_-16px_rgba(0,31,19,0.4)]"
                >
                  {option.label}
                  <ArrowRight size={18} className="shrink-0 text-[#07542f] transition group-hover:translate-x-1" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-12">
            <p className="ac-eyebrow-dot text-xs font-black uppercase tracking-[0.18em] text-[#8a6d00]">
              <Sparkles size={15} aria-hidden="true" /> Ton résultat
            </p>
            <h3 className="mt-3 text-[1.75rem] font-black uppercase leading-[1.15] tracking-[-0.01em] text-[#002f1d]">
              On te conseille de commencer par{" "}
              <span style={{ color: winner.accentText }}>{winner.label}</span>
            </h3>
            <div className="ac-rule-gold mt-4 max-w-[6rem]" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold italic text-slate-600">{winner.tagline}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {winner.formations.map((formation) => {
                const Icon = formation.icon;
                return (
                  <div key={formation.title} className="flex items-center gap-3 rounded-2xl border border-[#002f1d]/10 bg-[#fbfcfa] p-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border" style={{ background: `${winner.accent}1a`, color: winner.accent, borderColor: `${winner.accent}33` }} aria-hidden="true">
                      <Icon size={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-black uppercase leading-tight text-[#002f1d]">{formation.title}</p>
                      <p className="truncate text-xs font-semibold text-slate-500">{formation.outcome}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <AcademyCta url={academyUrl} className={PRIMARY_BTN}>
                Je me lance <ArrowRight size={18} aria-hidden="true" />
              </AcademyCta>
              <a href="#formations" className={GHOST_BTN}>
                Voir tout le catalogue
              </a>
              <button type="button" onClick={reset} className={`${GHOST_BTN} sm:ml-auto`}>
                <RotateCcw size={16} aria-hidden="true" /> Refaire le test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
