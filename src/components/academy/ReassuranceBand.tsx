"use client";

import { useEffect, useRef, useState } from "react";
import { ATOUTS, type Atout } from "@/lib/academy-data";

// Bande de réassurance premium : compteurs animés (count-up) au scroll, anneaux
// fins (pas d'aplats), chiffres mis en valeur, séparateurs apaisés.
// Respecte prefers-reduced-motion : affiche directement la valeur finale.

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function CountStat({ count, unit, active }: { count: number; unit?: string; active: boolean }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!active) return;
    // rAF n'est PAS couvert par la neutralisation CSS reduced-motion : ce garde JS
    // est le seul respect réel du réglage pour le count-up. Ne pas supprimer.
    if (prefersReducedMotion()) {
      const id = window.setTimeout(() => setN(count), 0);
      return () => window.clearTimeout(id);
    }
    let raf = 0;
    let startTs = 0;
    const duration = 1100;
    const tick = (ts: number) => {
      if (!startTs) startTs = ts;
      const progress = Math.min(1, (ts - startTs) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setN(Math.round(eased * count));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count, active]);

  return (
    <p className="text-xl font-black uppercase leading-tight tabular-nums text-[#002f1d] sm:text-2xl">
      {n}
      {unit ? ` ${unit}` : null}
    </p>
  );
}

export function ReassuranceBand() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="border-y border-[#002f1d]/10 bg-[linear-gradient(180deg,#ffffff,#fbfcf9)]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-[#002f1d]/8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {ATOUTS.map((atout: Atout) => {
          const Icon = atout.icon;
          return (
            <div className="flex items-center gap-3.5 px-4 py-8" key={atout.label}>
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border"
                style={{ background: `${atout.accent}0d`, borderColor: `${atout.accent}33`, color: atout.accent }}
                aria-hidden="true"
              >
                <Icon size={22} />
              </span>
              <div className="min-w-0">
                {typeof atout.count === "number" ? (
                  <CountStat count={atout.count} unit={atout.unit} active={visible} />
                ) : (
                  <p className="text-xl font-black uppercase leading-tight text-[#002f1d] sm:text-2xl">{atout.value}</p>
                )}
                <span className="ac-rule-gold mt-1.5 block max-w-[2.5rem]" aria-hidden="true" />
                <p className="mt-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-slate-500">{atout.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
