import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PublicWeeklyPlanning } from "@/components/PublicWeeklyPlanning";
import { listPublicWeeklyPlanning } from "@/lib/db/calendar";
import { getParisWeekWindow } from "@/lib/publication-activity";
import { publicPlanningWeek } from "@/lib/public-weekly-planning";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

// Les flèches « semaine précédente / suivante » n'ont aucune borne : un robot peut
// remonter indéfiniment de semaine en semaine et faire rendre (force-dynamic) autant
// de pages quasi vides. Le canonique pointe déjà sur /calendrier ; on ajoute noindex
// sur les vues datées, pour que les flèches restent suivies mais pas indexées.
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ week?: string }> }): Promise<Metadata> {
  const { week } = await searchParams;
  const base = pageMetadata("/calendrier");
  return week ? { ...base, robots: { index: false, follow: true } } : base;
}

function requestedReference(value: string | undefined): Date {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date();
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { week } = await searchParams;
  const reference = requestedReference(week);
  const window = getParisWeekWindow(reference);
  const planningWeek = publicPlanningWeek(reference);
  const items = await listPublicWeeklyPlanning(window.startIso, window.endExclusiveIso).catch(() => []);
  const first = new Date(`${planningWeek.mondayKey}T12:00:00Z`);
  const last = new Date(`${planningWeek.fridayKey}T12:00:00Z`);
  const label = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "long", year: "numeric" });

  return (
    <main className="min-h-[70vh] bg-[#002f21] px-3 py-8 text-white sm:px-6 sm:py-10 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-[#f7c600]">Planning du club</p>
            <h1 className="mt-1 text-2xl font-black uppercase sm:text-3xl">Semaine d’entraînement et événements</h1>
            <p className="mt-2 text-sm font-semibold text-white/70">Du {label.format(first)} au {label.format(last)}</p>
          </div>
          <nav className="flex items-center gap-2" aria-label="Navigation entre les semaines">
            <Link href={`/calendrier?week=${planningWeek.previousKey}`} className="focus-ring inline-flex size-11 items-center justify-center rounded-md border border-[#77762f] bg-[#11523f] text-[#f7c600] hover:bg-[#17634d]" aria-label="Semaine précédente"><ChevronLeft size={21} /></Link>
            <Link href="/calendrier" className="focus-ring inline-flex min-h-11 items-center rounded-md border border-[#77762f] bg-[#11523f] px-4 text-xs font-black uppercase text-white hover:bg-[#17634d]">Cette semaine</Link>
            <Link href={`/calendrier?week=${planningWeek.nextKey}`} className="focus-ring inline-flex size-11 items-center justify-center rounded-md border border-[#77762f] bg-[#11523f] text-[#f7c600] hover:bg-[#17634d]" aria-label="Semaine suivante"><ChevronRight size={21} /></Link>
          </nav>
        </header>
        <PublicWeeklyPlanning items={items} weekKeys={planningWeek.keys} />
      </section>
    </main>
  );
}
