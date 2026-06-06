import { CalendarDays, Clock, MapPin, Shield, Sparkles } from "lucide-react";

import { PremiumCta } from "@/components/PremiumCta";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { getCalendarPageData } from "@/lib/calendar-view";
import { images } from "@/lib/images";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Calendrier"
};

export default async function CalendarPage() {
  const calendar = await getCalendarPageData();
  const days = Array.from({ length: 31 }, (_, index) => index + 1);

  return (
    <>
      <PageHero description="Matchs, événements, stages et rendez-vous du club." image={images.pitch} title="Calendrier">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#f7c600]/40 bg-black/30 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#f7c600] backdrop-blur">
          <Sparkles size={15} />
          Saison officielle
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="club-panel overflow-hidden rounded-lg text-white">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative p-6 sm:p-8">
              <div className="absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-[#f7c600]/40 to-transparent lg:block" />
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f7c600]">Prochain rendez-vous</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black uppercase leading-tight sm:text-4xl">
                Le calendrier qui fait vivre le stade
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                Retrouvez les matchs, temps forts et événements à suivre pour soutenir les Jaune et Vert.
              </p>
            </div>

            <article className="grid gap-4 bg-white p-6 text-[#002f1d] sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-[#002f1d] px-3 py-1 text-xs font-black uppercase text-[#f7c600]">
                  {calendar.featured.eyebrow}
                </span>
                <span className="text-sm font-black uppercase text-[#002f1d]/70">{calendar.featured.dateLabel}</span>
              </div>
              <h3 className="text-2xl font-black uppercase leading-tight">{calendar.featured.title}</h3>
              {calendar.featured.home && calendar.featured.away ? (
                <p className="inline-flex items-center gap-2 text-sm font-black uppercase">
                  <Shield size={18} /> {calendar.featured.home} vs {calendar.featured.away}
                </p>
              ) : null}
              <div className="grid gap-2 text-sm font-semibold text-[#002f1d]/75">
                <p className="inline-flex items-center gap-2">
                  <Clock size={17} /> {calendar.featured.timeLabel}
                </p>
                <p className="inline-flex items-center gap-2">
                  <MapPin size={17} /> {calendar.featured.place}
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
        <div className="club-panel rounded-lg p-6 text-white">
          <div className="flex items-center gap-3">
            <CalendarDays className="text-[#f7c600]" />
            <h2 className="text-2xl font-black uppercase">{calendar.monthTitle}</h2>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-2 text-center text-sm">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
              <span className="font-black uppercase text-[#f7c600]" key={day}>
                {day}
              </span>
            ))}
            {days.map((day) => {
              const isHighlighted = calendar.highlightedDays.includes(day);
              return (
                <span
                  className={`rounded py-2 transition ${
                    isHighlighted ? "bg-[#f7c600] font-black text-[#002f1d] shadow-[0_0_22px_rgba(247,198,0,0.35)]" : "bg-white/10"
                  }`}
                  key={day}
                >
                  {day}
                </span>
              );
            })}
          </div>
        </div>

        <div>
          <SectionTitle eyebrow="Matchs et événements" title="Prochains rendez-vous" />
          <div className="space-y-4">
            {calendar.items.map((item) => (
              <article className="official-card group rounded-lg bg-white p-5 transition hover:-translate-y-1 hover:shadow-2xl" key={item.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-black uppercase text-[#f7c600]">
                    {item.dateLabel} · {item.timeLabel}
                  </p>
                  <span className="rounded-full bg-[#002f1d]/10 px-3 py-1 text-xs font-black uppercase text-[#002f1d]">
                    {item.eyebrow}
                  </span>
                </div>
                <h2 className="mt-3 text-2xl font-black uppercase text-[#002f1d]">{item.title}</h2>
                {item.home && item.away ? (
                  <p className="mt-2 text-sm font-black uppercase text-slate-800">
                    {item.home} vs {item.away}
                  </p>
                ) : null}
                <p className="mt-2 inline-flex items-center gap-2 text-slate-700">
                  <MapPin size={17} className="text-[#002f1d]" />
                  {item.place}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PremiumCta
        primaryHref="/equipes"
        primaryLabel="Voir les équipes"
        secondaryHref="/contact"
        secondaryLabel="Contacter le club"
        text="Chaque match est une occasion de faire vivre le stade, les familles et les couleurs du club."
        title="Venez soutenir les Jaune et Vert"
      />
    </>
  );
}
