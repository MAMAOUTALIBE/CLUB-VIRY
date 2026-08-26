"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, Info, MapPin, Trophy, UsersRound } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { recentResults as fallbackResults, trainingSchedule as fallbackSchedule, type RecentResult, type TrainingRow, type UpcomingMatch } from "@/lib/home-sports-data";

type Filter = "training" | "matches" | "results";
const filters: Array<{ value: Filter; label: string; icon: typeof CalendarDays }> = [
  { value: "training", label: "Entraînements", icon: CalendarDays },
  { value: "matches", label: "Matchs à venir", icon: Trophy }, { value: "results", label: "Résultats", icon: Trophy }
];
const pitchColors = { T1: "bg-[#9b5a17]", T2: "bg-[#d93670]", T3: "bg-[#e85e32]", T4: "bg-[#7040a8]" };
const pitchLabels = { T1: "Honneur", T2: "Synthétique", T3: "Annexe", T4: "Stade Henri Perrain" };
const shortWeekdays = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven."];

function Crest({ name }: { name: string }) {
  const viry = name.toLowerCase().includes("viry");
  return viry ? <Image src="/club-logo.svg" alt="Logo ES Viry" width={34} height={34} className="h-8 w-8 object-contain" /> : <span aria-label={`Logo ${name}`} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f5c400]/45 bg-[#001f16] text-[9px] font-black text-[#f5c400]">{name.split(/\s+/).map((word) => word[0]).join("").slice(0, 2)}</span>;
}

function PanelHeading({ icon: Icon, title, href, link }: { icon: typeof Trophy; title: string; href: string; link: string }) {
  return <div className="flex items-center justify-between gap-2 px-3 py-3"><h3 className="flex items-center gap-2 text-base font-black uppercase tracking-tight text-white"><Icon size={19} className="shrink-0 text-[#f5c400]" />{title}</h3><Link href={href} className="focus-ring flex shrink-0 items-center gap-1 text-[8px] font-black uppercase text-[#f5c400] hover:text-white">{link}<ArrowRight size={11} /></Link></div>;
}

export function HomeSportsHub(props: { matches?: UpcomingMatch[]; results?: RecentResult[]; schedule?: TrainingRow[]; weekLabel?: string }) {
  const { matches, results, schedule, weekLabel = "Semaine du 2 au 6 septembre 2026" } = props;
  const [active, setActive] = useState<Filter>("training");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const displayedMatches = matches?.length ? matches : [];
  const displayedResults = results ?? fallbackResults;
  const displayedSchedule = schedule ?? fallbackSchedule;
  const showTraining = active === "training";
  const showMatches = active === "matches";
  const showResults = active === "results";

  const selectTab = (index: number) => {
    const nextTab = filters[index];
    setActive(nextTab.value);
    tabRefs.current[index]?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % filters.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + filters.length) % filters.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = filters.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectTab(nextIndex);
  };

  return <section className="sports-hub relative isolate overflow-hidden bg-[#002f21] bg-[url('/stade/tribune.jpg')] bg-cover bg-center py-5 text-[#f5f2e8] sm:py-7" aria-label="Entraînements, matchs et résultats">
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,24,17,.76),rgba(0,47,33,.94)_30%,rgba(0,31,22,.98))]" aria-hidden="true" />
    <div className="relative mx-auto max-w-[1560px] px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[#f5c400]/35 bg-[#001f16]/70 p-1.5 shadow-[0_0_28px_rgba(245,196,0,.08)] backdrop-blur-xl">
        <div className="grid grid-cols-3 items-stretch gap-1" role="tablist" aria-label="Choisir le calendrier">
          {filters.map(({ value, label, icon: Icon }, index) => <button key={value} ref={(node) => { tabRefs.current[index] = node; }} id={`sports-tab-${value}`} type="button" role="tab" aria-selected={active === value} aria-controls={`sports-panel-${value}`} tabIndex={active === value ? 0 : -1} onClick={() => setActive(value)} onKeyDown={(event) => handleTabKeyDown(event, index)} className={`focus-ring flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-2 text-center text-[8px] font-black uppercase leading-tight transition min-[360px]:text-[9px] sm:min-h-20 sm:flex-row sm:gap-2 sm:px-3 sm:text-xs lg:text-sm ${active === value ? "bg-[linear-gradient(135deg,#f5c400,#ffd968)] text-[#002f21] shadow-[0_0_20px_rgba(245,196,0,.28)]" : "text-white/90 hover:bg-white/5 hover:text-white"}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border sm:h-10 sm:w-10 ${active === value ? "border-[#002f21]/20 bg-[#002f21]/15" : "border-[#f5c400]/35 bg-white/[.04]"}`}><Icon size={17} aria-hidden="true" /></span><span className="block min-w-0">{label}</span></button>)}
        </div>
      </div>

      <div className="mt-5">
        {showTraining ? <section id="sports-panel-training" role="tabpanel" aria-labelledby="sports-tab-training" className="h-full overflow-hidden rounded-3xl border border-[#f5c400]/65 bg-[#003c29]/72 p-3 sm:p-4">
          <div className="sm:hidden">
            <div className="px-1 py-2">
              <h3 className="flex items-center gap-3 text-2xl font-black uppercase text-white"><CalendarDays size={27} />Planning</h3>
              <p className="mt-2 text-sm font-bold text-[#f5c400]">{weekLabel}</p>
            </div>
            <div className="mt-3 grid gap-3">
              {displayedSchedule.slice(0, 2).map((row) => {
                const dayIndex = row.days.findIndex((slots) => slots.length > 0);
                const slot = dayIndex >= 0 ? row.days[dayIndex][0] : undefined;

                return <article key={row.category} className="grid grid-cols-[44px_minmax(0,1fr)] gap-3 rounded-2xl border border-[#f5c400]/45 bg-[#002f21]/55 p-4">
                  <div className="flex items-center justify-center border-r border-[#f5c400]/25 pr-3" style={{ color: row.accent }}><UsersRound size={34} /></div>
                  <div className="min-w-0">
                    <h4 className="text-xl font-black uppercase leading-none text-white">{row.category}</h4>
                    {row.subtitle ? <p className="mt-2 text-xs font-black uppercase" style={{ color: row.accent }}>{row.subtitle}</p> : null}
                    {slot ? <div className="mt-4 grid gap-2 text-sm">
                      <p className="flex items-center gap-2 font-bold text-white"><Clock3 size={17} className="shrink-0 text-[#f5c400]" />{shortWeekdays[dayIndex]} {slot.time}</p>
                      <p className="flex items-center gap-2 text-white/90"><b className={`rounded px-2 py-1 text-xs text-white ${pitchColors[slot.pitch]}`}>{slot.pitch}</b><span>{pitchLabels[slot.pitch]}</span></p>
                    </div> : <p className="mt-4 text-sm text-white/65">Aucun créneau renseigné.</p>}
                  </div>
                </article>;
              })}
            </div>
          </div>

          <div className="hidden sm:block">
          <div className="flex flex-wrap items-start justify-between gap-4 px-1 py-2">
            <div><h3 className="flex items-center gap-2 text-xl font-black uppercase text-white"><CalendarDays size={25} />Planning des entraînements</h3><p className="mt-1 pl-8 text-sm font-bold text-[#f5c400]">{weekLabel}</p></div>
            <div className="flex flex-wrap gap-3 text-[11px] font-bold">{Object.entries(pitchLabels).map(([pitch, label]) => <span className="flex items-center gap-1.5" key={pitch}><b className={`rounded px-1.5 py-1 text-white ${pitchColors[pitch as keyof typeof pitchColors]}`}>{pitch}</b>{label}</span>)}</div>
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
          <div className="px-1 pt-3 text-[11px]"><p className="flex items-center gap-2 text-white/75"><Info size={15} className="text-[#f5c400]" />Les horaires peuvent être modifiés. Vérifiez régulièrement les communications du club.</p></div>
          </div>
        </section> : null}

        {(showMatches || showResults) ? <div id={`sports-panel-${active}`} role="tabpanel" aria-labelledby={`sports-tab-${active}`} className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-[#f5c400]/55 bg-[#003c29]/72">
          {showMatches ? <section className="min-h-0 flex-1 overflow-hidden"><PanelHeading icon={CalendarDays} title="Prochains matchs" href="/calendrier" link="Voir tous les matchs" /><div className="space-y-1.5 px-3 pb-3">{displayedMatches.length ? displayedMatches.map(match => <article key={match.category + match.away} className="grid grid-cols-[minmax(0,1fr)_108px] overflow-hidden rounded-xl border border-[#f5c400]/20 bg-white/[.045]"><div className="p-2"><span className="rounded bg-[#f5c400] px-2 py-0.5 text-[8px] font-black uppercase text-[#002f21]">{match.category}</span><div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-center gap-1 text-center"><div className="flex min-w-0 flex-col items-center"><Crest name={match.home} /><b className="max-w-full truncate text-[9px] uppercase">{match.home}</b></div><b className="text-sm text-[#f5c400]">VS</b><div className="flex min-w-0 flex-col items-center"><Crest name={match.away} /><b className="max-w-full truncate text-[9px] uppercase">{match.away}</b></div></div></div><div className="flex flex-col justify-center border-l border-[#f5c400]/15 p-2 text-[9px]"><p className="flex gap-1 font-bold"><CalendarDays size={12} className="shrink-0 text-[#f5c400]" />{match.date}</p><p className="mt-1 flex gap-1 text-base font-black"><Clock3 size={13} className="shrink-0 text-[#f5c400]" />{match.time}</p><p className="mt-1 flex gap-1 text-[8px] leading-3 text-white/75"><MapPin size={11} className="shrink-0 text-[#f5c400]" />{match.venue}</p></div></article>) : <p className="rounded-xl border border-white/10 p-5 text-sm text-white/70">Aucun match programmé.</p>}</div></section> : null}
          {showResults ? <section className="p-3 sm:p-4"><div className="flex items-center gap-3 py-2"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#f5c400]/55 bg-[#f5c400]/10 text-[#f5c400] shadow-[0_0_18px_rgba(245,196,0,.22)]"><Trophy size={20} /></span><h3 className="text-lg font-black uppercase tracking-tight text-white sm:text-xl">Derniers résultats</h3></div><div className="mt-2 space-y-3">{displayedResults.length ? displayedResults.slice(0, 2).map(result => <article key={result.category + result.date} className="rounded-2xl border border-[#f5c400]/45 bg-[linear-gradient(135deg,rgba(255,255,255,.08),rgba(0,31,22,.48))] p-3 shadow-[inset_0_1px_0_rgba(255,226,116,.35),0_10px_24px_rgba(0,0,0,.18)] backdrop-blur-lg"><span className="inline-flex rounded-lg border border-[#f5c400]/35 bg-[#f5c400]/10 px-2.5 py-1 text-[9px] font-black uppercase text-[#ffd348]">{result.category}</span><div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 text-center"><b className="min-w-0 break-words text-[11px] uppercase leading-tight text-white sm:text-sm">{result.home}</b><strong className="whitespace-nowrap text-3xl font-black text-white sm:text-4xl">{result.homeScore} - {result.awayScore}</strong><b className="min-w-0 break-words text-[11px] uppercase leading-tight text-white sm:text-sm">{result.away}</b></div><p className="mt-1 text-center text-[10px] text-white/55 sm:text-xs">Terminé</p></article>) : <p className="rounded-xl border border-white/10 p-5 text-sm text-white/70">Aucun résultat publié.</p>}</div><Link href="/resultats" className="focus-ring mt-4 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#f5c400]/80 bg-[#002f21]/55 px-4 text-xs font-black uppercase text-[#f5c400] transition hover:bg-[#f5c400] hover:text-[#002f21]">Voir tous les résultats <ArrowRight size={18} /></Link></section> : null}
        </div> : null}
      </div>
    </div>
  </section>;
}
