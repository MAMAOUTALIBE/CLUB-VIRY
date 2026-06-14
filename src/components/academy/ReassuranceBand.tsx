"use client";

import { useEffect, useRef, useState } from "react";
import { ATOUTS, type Atout } from "@/lib/academy-data";

// Bande « Chiffres clés » premium (fond vert sombre, bordure or) avec compteurs
// animés (count-up) déclenchés au scroll. Respecte prefers-reduced-motion.

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function CountStat({ count, unit, active }: { count: number; unit?: string; active: boolean }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!active) return;
    // rAF non couvert par la neutralisation CSS reduced-motion : ce garde JS
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
    <p className="text-2xl font-black uppercase leading-tight tabular-nums text-white">
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
    <section ref={ref} className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[#f7c600]/45 bg-[#f7c600]/40 shadow-[0_24px_60px_-20px_rgba(0,18,11,0.55)] min-[380px]:grid-cols-2 lg:grid-cols-4">
          {ATOUTS.map((atout: Atout) => {
            const Icon = atout.icon;
            return (
              <div className="flex items-center gap-3.5 bg-[#001c10] px-5 py-7" key={atout.label}>
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[#f7c600] ring-1 ring-[#f7c600]/45"
                  style={{ background: "rgba(247,198,0,0.14)" }}
                  aria-hidden="true"
                >
                  <Icon size={24} />
                </span>
                <div className="min-w-0">
                  {typeof atout.count === "number" ? (
                    <CountStat count={atout.count} unit={atout.unit} active={visible} />
                  ) : (
                    <p className="text-2xl font-black uppercase leading-tight text-white">{atout.value}</p>
                  )}
                  <p className="mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-white/65">{atout.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
