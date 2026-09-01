import { Clock3, MapPin, UsersRound } from "lucide-react";

import { publicPitchLabels, publicPlanningDateKey, publicPlanningRows, type PublicPlanningItem } from "@/lib/public-weekly-planning";

const dayFormatter = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long" });
const dateFormatter = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "short" });
const timeFormatter = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" });

function PlanningSlot({ item }: { item: PublicPlanningItem }) {
  return (
    <article className="mx-2 flex min-h-[86px] w-[calc(100%-1rem)] flex-col items-center justify-center rounded-lg border border-[#77762f] bg-[#11523f] px-3 py-3 text-center text-white shadow-sm">
      <p className="inline-flex items-center justify-center gap-1.5 text-sm font-black tabular-nums">
        <Clock3 size={16} aria-hidden="true" />
        {timeFormatter.format(new Date(item.startsAt))}{item.endsAt ? ` – ${timeFormatter.format(new Date(item.endsAt))}` : ""}
      </p>
      {item.title ? <p className="mt-2 text-sm font-black leading-tight text-white">{item.title}</p> : null}
      {item.pitchCode || item.teamName ? <p className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-white/85">
        {item.pitchCode ? <span className="rounded bg-[#d92d72] px-2 py-0.5 text-xs font-black text-white">{item.pitchCode}</span> : null}
        {item.teamName ? <span>{item.teamName}</span> : null}
      </p> : null}
      {item.groupLabel ? <p className="mt-1 text-xs font-bold text-white/70">Groupe · {item.groupLabel}</p> : null}
    </article>
  );
}

export function PublicWeeklyPlanning({ items, weekKeys }: { items: PublicPlanningItem[]; weekKeys: string[] }) {
  const rows = publicPlanningRows(items);
  return (
    <div className="overflow-x-auto rounded-lg border border-[#77762f] bg-[#003e2d] [scrollbar-color:#f7c600_#003e2d]">
      <div className="min-w-[980px]">
        <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 border-b border-[#77762f] bg-[#002f21] px-4 py-3 text-xs font-bold text-white/80" aria-label="Légende des terrains">
          <MapPin className="text-[#f7c600]" size={16} aria-hidden="true" />
          {Object.entries(publicPitchLabels).map(([pitch, label]) => <span className="inline-flex items-center gap-1.5" key={pitch}><b className="rounded bg-[#d92d72] px-2 py-0.5 text-[11px] font-black text-white">{pitch}</b>{label}</span>)}
        </div>
        <div className="grid grid-cols-[210px_repeat(5,minmax(150px,1fr))] border-b border-[#77762f] bg-[#003526]">
          <span aria-hidden="true" />
          {weekKeys.map((key) => {
            const date = new Date(`${key}T12:00:00Z`);
            return <div key={key} className="border-l border-[#77762f] px-3 py-4 text-center"><p className="text-sm font-black uppercase text-[#f7c600]">{dayFormatter.format(date)}</p><p className="mt-1 text-xs font-bold text-white/60">{dateFormatter.format(date)}</p></div>;
          })}
        </div>
        {rows.length ? rows.map((row) => (
          <div key={row.key} className="grid min-h-[132px] grid-cols-[210px_repeat(5,minmax(150px,1fr))] border-b border-[#77762f] last:border-b-0">
            <div className="flex items-center gap-3 px-5 py-4 text-white">
              <UsersRound className="shrink-0 text-[#f7c600]" size={27} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-lg font-black uppercase leading-tight">{row.label}</p>
                {row.subtitle ? <p className="mt-1 text-xs font-black uppercase leading-tight text-[#f7c600]">{row.subtitle}</p> : null}
              </div>
            </div>
            {weekKeys.map((key) => <div key={key} className="flex flex-col justify-center gap-2 border-l border-[#77762f] py-3">{row.items.filter((item) => publicPlanningDateKey(item.startsAt) === key).map((item) => <PlanningSlot key={`${item.source}:${item.id}`} item={item} />)}</div>)}
          </div>
        )) : <div className="flex min-h-52 items-center justify-center px-6 text-center text-sm font-bold text-white/65">Aucun événement public planifié cette semaine.</div>}
      </div>
    </div>
  );
}
