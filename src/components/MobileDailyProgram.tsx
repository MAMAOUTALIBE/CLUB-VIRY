import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, MapPin, Trophy, UsersRound } from "lucide-react";
import { formatParisToday, selectDailyProgramItems } from "@/lib/daily-program";
import type { CalendarDisplayItem } from "@/lib/calendar-view";

const badgeClasses = { "Entraînement": "bg-[#f5c400] text-[#002f21]", Match: "bg-[#1675d1] text-white", Terminé: "bg-[#31933a] text-white", Annulé: "bg-[#b72c31] text-white" } as const;

/** Mobile/tablet home layout (< xl); desktop keeps HomeSportsHub unchanged. */
export function MobileDailyProgram({ items, now }: { items: CalendarDisplayItem[]; now: Date }) {
  const dailyItems = selectDailyProgramItems(items, now);
  return <section className="sports-hub relative isolate overflow-hidden bg-[#002f21] bg-[url('/stade/tribune.jpg')] bg-cover bg-center py-7 text-[#f5f2e8] xl:hidden" aria-labelledby="daily-program-title">
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,24,17,.82),rgba(0,47,33,.95)_30%,rgba(0,31,22,.98))]" aria-hidden="true" />
    <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
      <header className="flex items-start gap-3 px-1"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#f5c400]/55 bg-[#001f16]/60 text-[#f5c400]"><CalendarDays size={28} aria-hidden="true" /></span><div className="min-w-0 pt-1"><h2 id="daily-program-title" className="text-2xl font-black uppercase leading-tight text-white">Programme du jour</h2><p className="mt-1 text-sm font-bold text-[#f5c400]">{formatParisToday(now)}</p>{dailyItems.length ? <p className="mt-3 inline-flex rounded-full border border-[#f5c400]/55 px-3 py-1 text-[10px] font-black uppercase text-[#f5c400]">{dailyItems.length} événement{dailyItems.length > 1 ? "s" : ""}</p> : null}</div></header>
      <div className="mt-6 overflow-hidden rounded-3xl border border-[#f5c400]/55 bg-[#003c29]/72 p-4 backdrop-blur-xl">
        {dailyItems.length ? <div className="divide-y divide-[#f5c400]/20">{dailyItems.map((item) => { const Icon = item.kind === "event" ? UsersRound : Trophy; return <article key={`${item.kind}-${item.id}`} className="grid grid-cols-[42px_minmax(0,1fr)] gap-3 py-5 first:pt-1 last:pb-1"><span className="grid h-10 w-10 place-items-center rounded-full border border-[#f5c400]/45 bg-[#001f16]/55 text-[#f5c400]"><Icon size={21} aria-hidden="true" /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase ${badgeClasses[item.badge]}`}>{item.badge}</span><span className="inline-flex items-center gap-1 text-xs font-bold text-white/80"><Clock3 size={14} className="text-[#f5c400]" aria-hidden="true" />{item.timeLabel}</span></div>{item.kind === "match" ? <h3 className="mt-3 text-base font-black uppercase leading-tight text-white">{item.home} {item.showScore ? <span className="text-[#f5c400]">{item.homeScore} – {item.awayScore}</span> : <span className="text-[#f5c400]">vs</span>} {item.away}</h3> : <h3 className="mt-3 text-lg font-black uppercase leading-tight text-white">{item.title}</h3>}{item.place ? <p className="mt-2 flex items-start gap-2 text-sm text-white/75"><MapPin size={16} className="mt-0.5 shrink-0 text-[#f5c400]" aria-hidden="true" />{item.place}</p> : null}</div></article>; })}</div> : <p className="py-8 text-center text-sm font-bold text-white/75">Aucun événement prévu aujourd’hui</p>}
      </div>
      <Link href="/calendrier" className="focus-ring mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-[#f5c400]/80 bg-[#002f21]/65 px-4 text-sm font-black uppercase text-[#f5c400] transition hover:bg-[#f5c400] hover:text-[#002f21]">Voir tout le planning <ArrowRight size={19} aria-hidden="true" /></Link>
    </div>
  </section>;
}
