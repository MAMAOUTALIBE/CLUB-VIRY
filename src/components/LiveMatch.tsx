"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRightLeft, MapPin, Pause, Play, Radio, RotateCcw, Trophy } from "lucide-react";

// --- Données de démonstration ---
// Remplacer ce bloc par un flux temps réel (Supabase Realtime / API live) :
// la structure (events triés par minute + stats) est conçue pour ça.
type LiveEventType = "goal" | "yellow" | "red" | "sub" | "half" | "end";

type LiveEvent = {
  minute: number;
  type: LiveEventType;
  team: "home" | "away";
  label: string;
  detail?: string;
};

const FULL_TIME = 90;

const MATCH = {
  competition: "Championnat D1 · Journée 3",
  venue: "Stade Henri Longuet",
  home: { name: "ES Viry-Châtillon", short: "ES Viry", logo: true },
  away: { name: "Étampes FC", short: "Étampes", logo: false },
  stats: [
    { label: "Possession", home: 58, away: 42, suffix: "%" },
    { label: "Tirs", home: 14, away: 7 },
    { label: "Tirs cadrés", home: 6, away: 3 },
    { label: "Corners", home: 7, away: 4 }
  ],
  events: [
    { minute: 12, type: "goal", team: "home", label: "But", detail: "M. Diallo" },
    { minute: 27, type: "yellow", team: "away", label: "Carton jaune", detail: "K. Bernard" },
    { minute: 39, type: "goal", team: "away", label: "But", detail: "L. Marchand" },
    { minute: 45, type: "half", team: "home", label: "Mi-temps", detail: "1 — 1" },
    { minute: 58, type: "goal", team: "home", label: "But", detail: "A. Traoré" },
    { minute: 71, type: "sub", team: "home", label: "Changement", detail: "Sané ▸ Lopes" },
    { minute: 83, type: "goal", team: "home", label: "But (pénalty)", detail: "M. Diallo" },
    { minute: 90, type: "end", team: "home", label: "Coup de sifflet final", detail: "3 — 1" }
  ] as LiveEvent[]
};

function teamInitials(name: string) {
  return name
    .replace(/^ES\s+/i, "")
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function Crest({ name, logo }: { name: string; logo: boolean }) {
  if (logo) {
    return (
      <img
        src="/club-logo.svg"
        alt=""
        aria-hidden="true"
        width={72}
        height={72}
        className="h-14 w-14 rounded-full object-contain ring-2 ring-[#f7c600]/40 sm:h-[72px] sm:w-[72px]"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-white to-slate-200 text-lg font-black text-[#002f1d] ring-2 ring-white/20 sm:h-[72px] sm:w-[72px] sm:text-xl"
    >
      {teamInitials(name)}
    </span>
  );
}

function EventIcon({ type }: { type: LiveEventType }) {
  if (type === "goal") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f7c600] to-[#ffd84d] text-[#002f1d] shadow-[0_4px_12px_rgba(247,198,0,0.4)]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2.2 2.5 1.8-.95 2.95h-3.1L9.5 6 12 4.2Zm-6.2 4.5 2.45.05 1 3-1.9 2.45-2.35-.8A8 8 0 0 1 5.8 8.7Zm1.2 7.05 2.3.78L11 18.9l-.55 1.05a8 8 0 0 1-3.45-4.2Zm10.1 4.2L17 18.9l1.7-2.32 2.3-.78a8 8 0 0 1-3.45 4.2Zm1.7-6.2-1.9-2.45 1-3 2.45-.05a8 8 0 0 1 .7 4.7l-2.25.8Z" />
        </svg>
      </span>
    );
  }
  if (type === "yellow" || type === "red") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center">
        <span className={`h-5 w-3.5 rounded-[2px] ${type === "yellow" ? "bg-[#facc15]" : "bg-[#ef4444]"} shadow`} />
      </span>
    );
  }
  if (type === "sub") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
        <ArrowRightLeft size={16} aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70">
      <Radio size={15} aria-hidden="true" />
    </span>
  );
}

export function LiveMatch() {
  const [minute, setMinute] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      setMinute((current) => (current >= FULL_TIME ? current : current + 1));
    }, 850);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (minute >= FULL_TIME) {
      setRunning(false);
    }
  }, [minute]);

  const visibleEvents = MATCH.events.filter((event) => event.minute <= minute);
  const homeScore = visibleEvents.filter((event) => event.type === "goal" && event.team === "home").length;
  const awayScore = visibleEvents.filter((event) => event.type === "goal" && event.team === "away").length;
  const finished = minute >= FULL_TIME;
  const clockLabel = finished ? "Terminé" : minute === 0 ? "Coup d'envoi" : `${minute}'`;
  const lastEvent = visibleEvents[visibleEvents.length - 1];

  return (
    <div className="club-shell relative overflow-hidden rounded-2xl border border-[#f7c600]/25 text-white shadow-[0_30px_70px_rgba(0,18,11,0.4)]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#f7c600]/10 blur-3xl" />

      {/* Barre de statut */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-7">
        <div className="flex items-center gap-3">
          {finished ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-white/80">
              Terminé
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e11d48] px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_18px_rgba(225,29,72,0.6)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              En direct
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-[#f7c600]">
            <Trophy size={14} aria-hidden="true" />
            {MATCH.competition}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {finished ? (
            <button
              type="button"
              onClick={() => {
                setMinute(0);
                setRunning(true);
              }}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-[#f7c600]/40 px-3 py-1.5 text-xs font-black uppercase text-[#f7c600] transition hover:bg-[#f7c600]/10"
            >
              <RotateCcw size={14} aria-hidden="true" />
              Revoir le direct
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setRunning((value) => !value)}
              aria-label={running ? "Mettre en pause" : "Reprendre"}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs font-black uppercase text-white/80 transition hover:border-[#f7c600]/40 hover:text-[#f7c600]"
            >
              {running ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
              {running ? "Pause" : "Reprendre"}
            </button>
          )}
        </div>
      </div>

      {/* Tableau de score */}
      <div className="relative px-5 py-7 sm:px-7">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <Crest name={MATCH.home.name} logo={MATCH.home.logo} />
            <span className="text-sm font-black uppercase leading-tight sm:text-base">{MATCH.home.short}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-end gap-3 sm:gap-4">
              <span className="text-5xl font-black tabular-nums leading-none sm:text-6xl">{homeScore}</span>
              <span className="pb-1 text-2xl font-black text-white/40 sm:text-3xl">:</span>
              <span className="text-5xl font-black tabular-nums leading-none sm:text-6xl">{awayScore}</span>
            </div>
            <span
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
                finished ? "bg-white/10 text-white/70" : "bg-[#f7c600]/15 text-[#f7c600]"
              }`}
            >
              {!finished && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f7c600]" />}
              {clockLabel}
            </span>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <Crest name={MATCH.away.name} logo={MATCH.away.logo} />
            <span className="text-sm font-black uppercase leading-tight sm:text-base">{MATCH.away.short}</span>
          </div>
        </div>

        <p className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-white/55">
          <MapPin size={14} className="text-[#f7c600]" aria-hidden="true" />
          {MATCH.venue}
        </p>

        {/* Progression du match */}
        <div className="mt-5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#f7c600] to-[#ffd84d] transition-all duration-700 ease-linear"
              style={{ width: `${Math.min((minute / FULL_TIME) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Fil d'événements + statistiques */}
      <div className="relative grid gap-px bg-white/10">
        <div className="bg-[#00150d]/60 p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f7c600]">Fil du match</p>
          {visibleEvents.length === 0 ? (
            <p className="mt-4 text-sm text-white/55">Le match va commencer…</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {[...visibleEvents].reverse().map((event, index) => (
                <li key={`${event.minute}-${event.label}-${index}`} className="flex items-center gap-3">
                  <span className="w-9 shrink-0 text-right text-sm font-black tabular-nums text-white/55">{event.minute}'</span>
                  <EventIcon type={event.type} />
                  <span className="min-w-0">
                    <span className="block text-sm font-black uppercase leading-tight">
                      {event.label}
                      {event.detail ? <span className="font-bold text-white/70"> · {event.detail}</span> : null}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wide text-[#f7c600]/80">
                      {event.team === "home" ? MATCH.home.short : MATCH.away.short}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-[#00150d]/60 p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f7c600]">Statistiques</p>
          <div className="mt-4 space-y-4">
            {MATCH.stats.map((stat) => {
              const total = stat.home + stat.away || 1;
              const homePct = Math.round((stat.home / total) * 100);
              const suffix = stat.suffix ?? "";
              return (
                <div key={stat.label}>
                  <div className="flex items-center justify-between text-sm font-black tabular-nums">
                    <span>
                      {stat.home}
                      {suffix}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wide text-white/60">{stat.label}</span>
                    <span>
                      {stat.away}
                      {suffix}
                    </span>
                  </div>
                  <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-l-full bg-gradient-to-r from-[#f7c600] to-[#ffd84d] transition-all duration-700"
                      style={{ width: `${homePct}%` }}
                    />
                    <div className="h-full flex-1 bg-white/25" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pied : dernier fait + lien calendrier */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4 sm:px-7">
        <p className="text-xs font-bold text-white/55">
          {lastEvent ? (
            <>
              <span className="font-black uppercase text-[#f7c600]">Dernier fait · </span>
              {lastEvent.minute}' — {lastEvent.label}
              {lastEvent.detail ? ` (${lastEvent.detail})` : ""}
            </>
          ) : (
            "Suivez le match minute par minute."
          )}
        </p>
        <Link
          href="/calendrier"
          className="focus-ring inline-flex items-center gap-1.5 text-xs font-black uppercase text-white/80 underline decoration-[#f7c600] decoration-2 underline-offset-4 transition hover:text-[#f7c600]"
        >
          Tout le calendrier
        </Link>
      </div>
    </div>
  );
}
