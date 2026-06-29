import { CalendarDays, ChevronRight, Clock, MapPin, Shield, Sparkles } from "lucide-react";
import Link from "next/link";

import { DesktopOnly, MobileCard, MobileScreen, MobileScrollableList } from "@/components/MobilePage";
import { PremiumCta } from "@/components/PremiumCta";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { getCalendarPageData } from "@/lib/calendar-view";
import { images } from "@/lib/images";
import { socialItems, isLiveSocial } from "@/lib/socials";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300; // ISR : contenu CMS rafraichi toutes les 5 min

export const metadata = pageMetadata("/calendrier");

export default async function CalendarPage() {
  const calendar = await getCalendarPageData();
  // Grille calendaire correcte : vrai nombre de jours + offset du 1er jour (semaine commençant lundi).
  const daysInMonth = new Date(calendar.year, calendar.month + 1, 0).getDate();
  const firstWeekday = new Date(calendar.year, calendar.month, 1).getDay(); // 0 = dimanche
  const leadingBlanks = (firstWeekday + 6) % 7;
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  const now = new Date();
  const todayDate = now.getFullYear() === calendar.year && now.getMonth() === calendar.month ? now.getDate() : null;

  // Stats du mois pour combler élégamment le panneau de gauche.
  const matchCount = calendar.items.filter((item) => item.kind === "match").length;
  const homeCount = calendar.items.filter(
    (item) => item.kind === "match" && (item.home ?? "").toLowerCase().includes("viry")
  ).length;
  const stats = [
    { value: calendar.items.length, label: "Rendez-vous" },
    { value: matchCount, label: "Matchs" },
    { value: homeCount, label: "À domicile" }
  ];

  return (
    <>
      <MobileScreen
        eyebrow={calendar.monthTitle}
        title="Calendrier"
        description="Le prochain rendez-vous reste visible, la liste complète défile dans la zone centrale."
        actions={[{ href: "/resultats", label: "Voir les résultats", variant: "secondary" }]}
      >
        <div className="flex h-full min-h-0 flex-col gap-3">
          <MobileCard>
            <p className="text-xs font-black uppercase text-[#664d00]">{calendar.featured.eyebrow}</p>
            <h2 className="mt-1 text-lg font-black uppercase text-[#002f1d]">{calendar.featured.title}</h2>
            <p className="mt-2 text-sm font-bold text-slate-700">
              {calendar.featured.dateLabel} · {calendar.featured.timeLabel}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-600">{calendar.featured.place}</p>
          </MobileCard>
          <MobileScrollableList>
            {calendar.items.map((item) => (
              <MobileCard key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase text-[#664d00]">{item.eyebrow}</p>
                    <h2 className="mt-1 text-base font-black uppercase text-[#002f1d]">{item.title}</h2>
                  </div>
                  <span className="shrink-0 text-right text-xs font-black uppercase text-slate-600">{item.dateLabel}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {item.timeLabel} · {item.place}
                </p>
              </MobileCard>
            ))}
          </MobileScrollableList>
        </div>
      </MobileScreen>
      <DesktopOnly>
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

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:px-8 3xl:grid-cols-[0.72fr_1.28fr]">
        <div className="club-panel rounded-2xl p-6 text-white lg:sticky lg:top-28">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7c600]/15 text-[#f7c600]">
              <CalendarDays size={22} />
            </span>
            <h2 className="text-2xl font-black uppercase">{calendar.monthTitle}</h2>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-1.5 text-center text-sm" role="grid" aria-label={`Calendrier ${calendar.monthTitle}`}>
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
              <span className="pb-1 text-xs font-black uppercase tracking-wide text-[#f7c600]/90" key={day}>
                {day}
              </span>
            ))}
            {Array.from({ length: leadingBlanks }).map((_, index) => (
              <span aria-hidden="true" key={`blank-${index}`} />
            ))}
            {days.map((day) => {
              const isHighlighted = calendar.highlightedDays.includes(day);
              const isToday = day === todayDate;
              return (
                <span
                  className={`flex h-10 items-center justify-center rounded-lg text-sm transition sm:h-11 ${
                    isHighlighted
                      ? "bg-gradient-to-br from-[#f7c600] to-[#ffd84d] font-black text-[#002f1d] shadow-[0_6px_16px_rgba(247,198,0,0.32)]"
                      : "bg-white/[0.06] text-white/85 hover:bg-white/[0.14]"
                  } ${isToday && !isHighlighted ? "ring-2 ring-[#f7c600]/70" : ""}`}
                  key={day}
                >
                  {day}
                </span>
              );
            })}
          </div>

          {/* Contenu sous la grille : légende, stats, lieu, réseaux */}
          <div className="mt-7 space-y-5 border-t border-white/10 pt-6">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-white/70">
              <span aria-hidden="true" className="h-5 w-5 rounded-md bg-gradient-to-br from-[#f7c600] to-[#ffd84d]" />
              Jour de match ou d'événement
            </div>

            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div className="rounded-xl border border-[#f7c600]/15 bg-white/[0.04] p-3 text-center" key={stat.label}>
                  <p className="text-2xl font-black text-[#f7c600]">{stat.value}</p>
                  <p className="mt-0.5 text-[10px] font-black uppercase tracking-wide text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>

            <Link
              className="focus-ring group flex items-center gap-3 rounded-xl border border-[#f7c600]/15 bg-white/[0.04] p-4 transition hover:border-[#f7c600]/40"
              href="/le-club/stade-henri-longuet"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f7c600]/15 text-[#f7c600]">
                <MapPin size={20} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-black uppercase text-white">Stade Henri Longuet</span>
                <span className="block truncate text-xs text-white/60">Avenue de l'Armée Leclerc · Viry-Châtillon</span>
              </span>
              <ChevronRight aria-hidden="true" className="ml-auto shrink-0 text-[#f7c600] transition group-hover:translate-x-0.5" size={18} />
            </Link>

            <div className="rounded-xl border border-[#f7c600]/15 bg-white/[0.04] p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f7c600]">Ne rien manquer</p>
              <p className="mt-1.5 text-sm leading-6 text-white/65">
                Compositions, résultats et changements d'horaire en temps réel sur nos réseaux.
              </p>
              <div className="mt-3 flex flex-wrap gap-2" aria-label="Réseaux sociaux">
                {socialItems.map((social) => {
                  // Lien cliquable seulement si une vraie URL est configurée ;
                  // sinon icône décorative (évite un <a href=""> qui recharge la page).
                  const className =
                    "focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:ring-2 hover:ring-[#f7c600]/60";
                  const style = {
                    background: social.background,
                    borderColor: social.borderColor,
                    color: social.color,
                    boxShadow: social.label === "TikTok" ? "1.5px 0 0 #fe2c55, -1.5px 0 0 #25f4ee" : undefined
                  };
                  const icon = (
                    <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox={social.viewBox}>
                      <path d={social.path} />
                    </svg>
                  );
                  return isLiveSocial(social) ? (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      title={social.label}
                      rel="noopener noreferrer"
                      target="_blank"
                      className={className}
                      style={style}
                    >
                      {icon}
                    </a>
                  ) : (
                    <span key={social.label} aria-label={social.label} title={social.label} role="img" className={className} style={style}>
                      {icon}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div>
          <SectionTitle eyebrow="Matchs et événements" title="Prochains rendez-vous" />
          <div className="space-y-4 2xl:grid 2xl:grid-cols-2 2xl:gap-4 2xl:space-y-0">
            {calendar.items.map((item) => (
              <article className="official-card group rounded-lg bg-white p-5 transition hover:-translate-y-1 hover:shadow-2xl" key={item.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-black uppercase text-[#664d00]">
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
      </DesktopOnly>
    </>
  );
}
