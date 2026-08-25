"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, Grid2X2, Info, MapPin, Trophy, UsersRound } from "lucide-react";
import { useState } from "react";
import { featuredNews, recentResults as fallbackResults, trainingSchedule as fallbackSchedule, type FeaturedNews, type RecentResult, type TrainingRow, type UpcomingMatch } from "@/lib/home-sports-data";

type Filter = "all" | "training" | "matches" | "results";
const filters: Array<{ value: Filter; label: string; icon: typeof Grid2X2 }> = [
  { value: "all", label: "Tous", icon: Grid2X2 }, { value: "training", label: "Entraînements", icon: CalendarDays },
  { value: "matches", label: "Matchs à venir", icon: Trophy }, { value: "results", label: "Résultats", icon: Trophy }
];
const pitchColors = { T1: "bg-[#9b5a17]", T2: "bg-[#d93670]", T3: "bg-[#e85e32]", T4: "bg-[#7040a8]" };

function Crest({ name }: { name: string }) {
  const viry = name.toLowerCase().includes("viry");
  return viry ? <Image src="/club-logo.svg" alt="Logo ES Viry" width={34} height={34} className="h-8 w-8 object-contain" /> : <span aria-label={`Logo ${name}`} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f5c400]/45 bg-[#001f16] text-[9px] font-black text-[#f5c400]">{name.split(/\s+/).map((word) => word[0]).join("").slice(0, 2)}</span>;
}

function PanelHeading({ icon: Icon, title, href, link }: { icon: typeof Trophy; title: string; href: string; link: string }) {
  return <div className="flex items-center justify-between gap-2 px-3 py-3"><h3 className="flex items-center gap-2 text-base font-black uppercase tracking-tight text-white"><Icon size={19} className="shrink-0 text-[#f5c400]" />{title}</h3><Link href={href} className="focus-ring flex shrink-0 items-center gap-1 text-[8px] font-black uppercase text-[#f5c400] hover:text-white">{link}<ArrowRight size={11} /></Link></div>;
}

export function HomeSportsHub({ matches, results, schedule, weekLabel = "Semaine du 2 au 6 septembre 2026", news }: { matches?: UpcomingMatch[]; results?: RecentResult[]; schedule?: TrainingRow[]; weekLabel?: string; news?: FeaturedNews }) {
  const [active, setActive] = useState<Filter>("all");
  const displayedMatches = matches?.length ? matches : [];
  const displayedResults = results ?? fallbackResults;
  const displayedSchedule = schedule ?? fallbackSchedule;
  const story = news ?? featuredNews;
  const showTraining = active === "all" || active === "training";
  const showMatches = active === "all" || active === "matches";
  const showResults = active === "all" || active === "results";

  return <section className="sports-hub relative isolate overflow-hidden bg-[#002f21] py-5 text-[#f5f2e8] sm:py-7" aria-label="Entraînements, matchs et résultats">
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,28,20,.7),rgba(0,47,33,.96)_28%,#002f21)]" aria-hidden="true" />
    <div className="relative mx-auto max-w-[1560px] px-4 sm:px-6 lg:px-8">
      <div className="overflow-x-auto rounded-2xl border border-[#f5c400]/30 bg-[#001f16]/65 p-1.5 [scrollbar-width:none]">
        <div className="flex min-w-max items-center gap-1" role="group" aria-label="Filtrer la section">
          {filters.map(({ value, label, icon: Icon }) => <button key={value} type="button" aria-pressed={active === value} onClick={() => setActive(value)} className={`focus-ring flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-black uppercase transition sm:px-8 ${active === value ? "bg-[#f5c400] text-[#002f21]" : "text-white/85 hover:bg-white/5 hover:text-white"}`}><Icon size={18} />{label}</button>)}
        </div>
      </div>

      <div className={`mt-5 grid items-stretch gap-4 ${showTraining && (showMatches || showResults) ? "xl:grid-cols-[minmax(0,2.35fr)_minmax(310px,.85fr)]" : ""}`}>
        {showTraining ? <section className="h-full overflow-hidden rounded-3xl border border-[#f5c400]/65 bg-[#003c29]/72 p-3 sm:p-4">
          <div className="flex flex-wrap items-start justify-between gap-4 px-1 py-2">
            <div><h3 className="flex items-center gap-2 text-xl font-black uppercase text-white"><CalendarDays size={25} />Planning des entraînements</h3><p className="mt-1 pl-8 text-sm font-bold text-[#f5c400]">{weekLabel}</p></div>
            <div className="flex flex-wrap gap-3 text-[11px] font-bold">{Object.entries({ T1: "Honneur", T2: "Synthétique", T3: "Annexe", T4: "Stade Henri Perrain" }).map(([pitch, label]) => <span className="flex items-center gap-1.5" key={pitch}><b className={`rounded px-1.5 py-1 text-white ${pitchColors[pitch as keyof typeof pitchColors]}`}>{pitch}</b>{label}</span>)}</div>
          </div>
          <div className="mt-3 overflow-x-auto rounded-xl border border-[#f5c400]/20 [scrollbar-color:#f5c400_#003c29]">
            <div className="min-w-[760px] lg:min-w-0">
              <div className="grid grid-cols-[140px_repeat(5,minmax(0,1fr))] bg-[#002f21]/70 text-center text-xs font-black uppercase tracking-wide text-[#f5c400]"><span className="p-3" />{["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"].map(day => <span key={day} className="border-l border-[#f5c400]/18 p-3">{day}</span>)}</div>
              {displayedSchedule.map(row => <div key={row.category} className="grid min-h-24 grid-cols-[140px_repeat(5,minmax(0,1fr))] border-t border-[#f5c400]/18">
                <div className="flex items-center gap-2 px-3" style={{ color: row.accent }}><UsersRound size={24} /><div><p className="text-sm font-black uppercase text-white">{row.category}</p>{row.subtitle ? <p className="mt-1 text-[9px] font-bold uppercase" style={{ color: row.accent }}>{row.subtitle}</p> : null}</div></div>
                {row.days.map((slots, dayIndex) => <div className="flex flex-col justify-center gap-1.5 border-l border-[#f5c400]/18 p-2" key={dayIndex}>{slots.map((slot, slotIndex) => <div key={slot.time + slotIndex} className="rounded-xl border border-[#f5c400]/15 bg-white/[.035] p-2 text-center text-[10px]"><p className="flex items-center justify-center gap-1 font-bold text-white"><Clock3 size={12} />{slot.time}</p><p className="mt-1 text-white/85"><b className={`mr-1 rounded px-1 py-0.5 text-[9px] text-white ${pitchColors[slot.pitch]}`}>{slot.pitch}</b>{slot.group}</p></div>)}</div>)}
              </div>)}
            </div>
          </div>
          <div className="flex flex-col items-start justify-between gap-3 px-1 pt-3 text-[11px] sm:flex-row sm:items-center"><p className="flex items-center gap-2 text-white/75"><Info size={15} className="text-[#f5c400]" />Les horaires peuvent être modifiés. Vérifiez régulièrement les communications du club.</p><Link href="/formation" className="focus-ring flex min-h-10 shrink-0 items-center gap-3 rounded-lg border border-[#f5c400]/55 px-5 font-black uppercase text-[#f5c400] hover:bg-[#f5c400] hover:text-[#002f21]">Voir le planning complet <ArrowRight size={15} /></Link></div>
        </section> : null}

        {(showMatches || showResults) ? <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-[#f5c400]/55 bg-[#003c29]/72">
          {showMatches ? <section className="min-h-0 flex-1 overflow-hidden"><PanelHeading icon={CalendarDays} title="Prochains matchs" href="/calendrier" link="Voir tous les matchs" /><div className="space-y-1.5 px-3 pb-3">{displayedMatches.length ? displayedMatches.map(match => <article key={match.category + match.away} className="grid grid-cols-[minmax(0,1fr)_108px] overflow-hidden rounded-xl border border-[#f5c400]/20 bg-white/[.045]"><div className="p-2"><span className="rounded bg-[#f5c400] px-2 py-0.5 text-[8px] font-black uppercase text-[#002f21]">{match.category}</span><div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-center gap-1 text-center"><div className="flex min-w-0 flex-col items-center"><Crest name={match.home} /><b className="max-w-full truncate text-[9px] uppercase">{match.home}</b></div><b className="text-sm text-[#f5c400]">VS</b><div className="flex min-w-0 flex-col items-center"><Crest name={match.away} /><b className="max-w-full truncate text-[9px] uppercase">{match.away}</b></div></div></div><div className="flex flex-col justify-center border-l border-[#f5c400]/15 p-2 text-[9px]"><p className="flex gap-1 font-bold"><CalendarDays size={12} className="shrink-0 text-[#f5c400]" />{match.date}</p><p className="mt-1 flex gap-1 text-base font-black"><Clock3 size={13} className="shrink-0 text-[#f5c400]" />{match.time}</p><p className="mt-1 flex gap-1 text-[8px] leading-3 text-white/75"><MapPin size={11} className="shrink-0 text-[#f5c400]" />{match.venue}</p></div></article>) : <p className="rounded-xl border border-white/10 p-5 text-sm text-white/70">Aucun match programmé.</p>}</div></section> : null}
          {showResults ? <section className="border-t border-[#f5c400]/30"><PanelHeading icon={Trophy} title="Derniers résultats" href="/resultats" link="Voir tous les résultats" /><div className="space-y-1.5 px-3 pb-3">{displayedResults.length ? displayedResults.map(result => <article key={result.category + result.date} className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-2 rounded-xl border border-[#f5c400]/20 bg-white/[.045] p-2"><span className="rounded bg-[#f5c400] px-1 py-1 text-center text-[8px] font-black uppercase text-[#002f21]">{result.category}</span><p className="flex min-w-0 items-center justify-center gap-1.5 text-[9px] font-black uppercase"><span className="truncate text-right">{result.home}</span><strong className="whitespace-nowrap text-lg text-white">{result.homeScore} - {result.awayScore}</strong><span className="truncate">{result.away}</span></p></article>) : <p className="px-2 pb-3 text-xs text-white/65">Aucun résultat publié.</p>}</div></section> : null}
          {active === "all" ? <article className="grid min-h-28 grid-cols-[30%_1fr] overflow-hidden border-t border-[#f5c400]/30"><div className="relative"><Image src={story.image} alt="Joueurs de l'ES Viry célébrant une victoire" fill sizes="180px" className="object-cover" /></div><div className="p-3"><p className="text-[9px] font-black uppercase tracking-wider text-[#f5c400]">☆ {story.badge}</p><h3 className="mt-1 text-sm font-black uppercase text-white">{story.title}</h3><p className="mt-1 line-clamp-2 text-[10px] leading-4 text-white/75">{story.description}</p><div className="mt-2 flex items-center justify-between gap-2"><span className="text-[8px] font-bold uppercase text-white/55">{story.category}</span><Link href={story.href} className="focus-ring flex items-center gap-1 rounded-md border border-[#f5c400]/45 px-2 py-1.5 text-[8px] font-black uppercase text-[#f5c400]">Lire <ArrowRight size={11} /></Link></div></div></article> : null}
        </div> : null}
      </div>
    </div>
  </section>;
}
