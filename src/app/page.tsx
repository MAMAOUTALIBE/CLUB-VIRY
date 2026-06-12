import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, CalendarDays, Clock, Flag, Handshake, HeartHandshake, MapPin, Sparkles, Ticket, Trophy, Users } from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { Stagger, StaggerItem } from "@/components/Motion";
import { SectionTitle } from "@/components/SectionTitle";
import { matches, partners, teams } from "@/lib/data";
import { iconByName } from "@/lib/icon-map";
import { images } from "@/lib/images";
import { getPublicNews, getSiteSettings } from "@/lib/public-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata = {
  alternates: { canonical: "/" }
};

export const dynamic = "force-dynamic";

// JSON-LD WebSite (uniquement sur l'accueil) : aide Google a afficher le nom du site.
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ES Viry-Châtillon Football",
  url: siteUrl,
  inLanguage: "fr-FR"
};

export default async function HomePage() {
  const [allNews, settings] = await Promise.all([getPublicNews(5), getSiteSettings()]);
  const leadNews = allNews[0];
  const gridNews = allNews.slice(1, 5);
  const clubStats = settings.club_stats;
  const values = settings.values;
  const quickActions = [
    { label: "Inscriptions", href: "/inscriptions", icon: Users, text: "Rejoindre le club" },
    { label: "Détections", href: "/detections-recrutement", icon: Flag, text: "Montrer son talent" },
    { label: "Calendrier", href: "/calendrier", icon: CalendarDays, text: "Suivre les matchs" },
    { label: "Partenaires", href: "/partenaires", icon: HeartHandshake, text: "Associer son image" }
  ];

  const nextMatch = matches[0];
  const otherMatches = matches.slice(1);
  const isClub = (name: string) => name.toLowerCase().includes("viry");
  const teamInitials = (name: string) =>
    name
      .replace(/^ES\s+/i, "")
      .split(/[\s-]+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
  const shortTeam = (name: string) => (isClub(name) ? "ES Viry" : name);
  const crest = (name: string, size: "sm" | "lg") => {
    const dim = size === "lg" ? "h-16 w-16 sm:h-[84px] sm:w-[84px]" : "h-9 w-9";
    return isClub(name) ? (
      <img
        src="/club-logo.svg"
        alt=""
        aria-hidden="true"
        className={`${dim} shrink-0 rounded-full object-contain ring-2 ring-[#f7c600]/40`}
        width={84}
        height={84}
      />
    ) : (
      <span
        aria-hidden="true"
        className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f7c600] to-[#ffd84d] font-black text-[#002f1d] ring-2 ring-white/15 ${
          size === "lg" ? "text-lg sm:text-2xl" : "text-[11px]"
        }`}
      >
        {teamInitials(name)}
      </span>
    );
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <section className="hero-stadium image-tint relative isolate flex min-h-[640px] flex-col overflow-hidden border-b border-[#f7c600]/35 text-white lg:h-[calc(100svh-var(--header-h))] lg:min-h-0">
        {/* LCP : hero en next/image (priority -> preload auto + AVIF/WebP). zIndex:0 inline
            pour rester sous le contenu (z-[2]) ; .hero-stadium::before neutralise le voile. */}
        <Image src={images.stadiumHero} alt="" fill priority sizes="100vw" className="object-cover" style={{ objectPosition: "center 90%", zIndex: 0 }} />
        {/* Contenu principal (centré, occupe l'espace disponible) */}
        <div className="relative z-[2] mx-auto flex w-full max-w-[1720px] flex-1 items-center px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            {/* Hero above-the-fold rendu en HTML statique (pas de framer-motion) :
                le LCP ne depend plus de l'hydratation JS. */}
            <div>
              <div>
                <h1 className="max-w-4xl">
                  <span className="font-script block text-6xl leading-[1.05] text-[#f7c600] drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)] sm:text-7xl lg:text-7xl xl:text-8xl 2xl:text-8xl">
                    Une passion
                  </span>
                  <span className="font-script -mt-1 block pl-6 text-6xl leading-[1.05] text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)] sm:text-7xl lg:text-7xl xl:text-8xl 2xl:text-8xl">
                    notre force
                  </span>
                </h1>
                <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white/90 sm:text-lg">
                  Porté par un nouveau bureau nouvellement nommé, notre club ouvre un nouveau chapitre.
                </p>
                <div className="mt-4 h-1 w-24 rounded-full bg-[#f7c600]" />
                <div className="mt-7 flex flex-wrap gap-4">
                  <Link className="focus-ring inline-flex items-center gap-4 rounded-lg bg-[#f7c600] px-7 py-3.5 text-sm font-black uppercase text-[#001c10] shadow-[0_18px_34px_rgba(247,198,0,0.28)] transition hover:-translate-y-0.5 hover:bg-white" href="/le-club">
                    Découvrir le club
                    <ArrowRight size={22} aria-hidden="true" />
                  </Link>
                  <Link className="focus-ring inline-flex items-center gap-4 rounded-lg border border-white/70 bg-black/10 px-7 py-3.5 text-sm font-black uppercase text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-[#f7c600] hover:text-[#f7c600]" href="/equipes">
                    Nos équipes
                    <ArrowRight size={22} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="hidden justify-center lg:flex">
              <div className="relative min-h-[300px] w-full max-w-[600px]">
                <div className="absolute left-1/2 top-0 h-[210px] w-[210px] -translate-x-1/2 rounded-full bg-[#f7c600]/20 blur-3xl" aria-hidden="true" />
                <img className="absolute left-1/2 top-0 h-[210px] w-[210px] -translate-x-1/2 rounded-full object-contain drop-shadow-2xl 2xl:h-[250px] 2xl:w-[250px]" src="/club-logo.svg" alt="ES Viry-Châtillon Football" width={250} height={250} />
              </div>
            </div>
          </div>
        </div>

        {/* Barre statistiques : tout en bas du hero, compacte, une seule ligne par carte */}
        <div className="relative z-[2] mx-auto w-full max-w-[1560px] shrink-0 px-4 pb-4 sm:px-6 lg:px-8 lg:pb-5">
          <Stagger
            aria-label="Chiffres clés du club"
            className="grid overflow-hidden rounded-xl border border-white/15 bg-[#00150d]/75 shadow-[0_22px_55px_rgba(0,18,11,0.5)] ring-1 ring-[#f7c600]/10 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-5"
          >
            {clubStats.map((stat) => {
              const Icon = iconByName(stat.iconName);
              return (
                <StaggerItem
                  className="flex items-center gap-2.5 border-b border-white/10 px-4 py-2.5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:py-3"
                  key={stat.label}
                >
                  <Icon className="shrink-0 text-[#f7c600]" size={26} strokeWidth={1.9} aria-hidden="true" />
                  <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                    <span className="text-base font-black uppercase leading-none text-white lg:text-lg">{stat.value}</span>
                    <span className="text-base font-black uppercase leading-none tracking-wide text-white/80 lg:text-lg">{stat.label}</span>
                  </p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

	      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
	        <Stagger className="grid overflow-hidden rounded-2xl border border-[#002f1d]/10 bg-white shadow-[0_20px_55px_rgba(0,31,19,0.12)] md:grid-cols-2 xl:grid-cols-4">
	          {quickActions.map((action) => {
	            const Icon = action.icon;
	            return (
	              <StaggerItem key={action.label}>
	                <Link className="focus-ring flex min-h-28 items-center gap-4 border-b border-[#002f1d]/10 p-5 transition hover:bg-[#f7c600]/10 md:border-r xl:border-b-0" href={action.href}>
	                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#002f1d] text-[#f7c600]">
	                    <Icon size={25} aria-hidden="true" />
	                  </div>
	                  <div>
	                    <p className="text-[11px] font-black uppercase tracking-wide text-[#8a6d00]">Accès rapide</p>
	                    <h2 className="mt-1 text-xl font-black uppercase leading-none text-[#002f1d]">{action.label}</h2>
	                    <p className="mt-2 text-sm font-bold text-slate-600">{action.text}</p>
	                  </div>
	                </Link>
	              </StaggerItem>
	            );
	          })}
	        </Stagger>
	      </section>

      <section className="mx-auto grid max-w-7xl items-stretch gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
        {/* ── Prochain match : carte premium type tableau d'affichage ── */}
        <div className="club-panel relative overflow-hidden rounded-3xl text-white">
          <div className="stadium-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#f7c600]/20 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#0a6b3d]/45 blur-3xl" aria-hidden="true" />
          <div className="relative grid min-h-full lg:grid-cols-[1fr_0.74fr]">
            <div className="relative p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#f7c600]/30 bg-[#f7c600]/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#f7c600]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f7c600]/70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f7c600]" />
                  </span>
                  Matchday
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white/85 ring-1 ring-white/15">
                  <MapPin size={12} className="text-[#f7c600]" aria-hidden="true" />
                  {isClub(nextMatch.home) ? "À domicile" : "Extérieur"}
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-black uppercase leading-[0.95] sm:text-[2.6rem]">
                Prochain
                <span className="block text-[#f7c600]">rendez-vous</span>
              </h2>
              <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/[0.07] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white/85">
                <Trophy size={14} className="text-[#f7c600]" aria-hidden="true" />
                {nextMatch.team}
              </p>

              <div className="light-sweep relative mt-6 overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.09] to-black/25 p-6 sm:p-7">
                <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-4">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="relative">
                      <span className="absolute inset-0 -z-10 rounded-full bg-[#f7c600]/25 blur-xl" aria-hidden="true" />
                      {crest(nextMatch.home, "lg")}
                    </div>
                    <span className="text-sm font-black uppercase leading-tight sm:text-base">{shortTeam(nextMatch.home)}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 pt-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f7c600] text-xs font-black text-[#002f1d] shadow-[0_0_30px_rgba(247,198,0,0.6)]">
                      VS
                    </span>
                    <span className="rounded-full bg-black/30 px-2.5 py-1 text-base font-black tabular-nums tracking-tight text-[#f7c600]">
                      {nextMatch.time}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="relative">
                      <span className="absolute inset-0 -z-10 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
                      {crest(nextMatch.away, "lg")}
                    </div>
                    <span className="text-sm font-black uppercase leading-tight sm:text-base">{shortTeam(nextMatch.away)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                <span className="inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] p-3 text-sm font-bold text-white/85">
                  <CalendarDays className="shrink-0 text-[#f7c600]" size={18} aria-hidden="true" />
                  {nextMatch.date}
                </span>
                <span className="inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] p-3 text-sm font-bold text-white/85">
                  <MapPin className="shrink-0 text-[#f7c600]" size={18} aria-hidden="true" />
                  {nextMatch.place}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/calendrier">Voir le calendrier</ButtonLink>
                <ButtonLink href="/equipes/seniors-r1" variant="outline">Fiche équipe</ButtonLink>
              </div>
            </div>

            <div className="relative border-t border-white/10 bg-[#00120b]/55 p-5 sm:p-6 lg:border-l lg:border-t-0">
              <div className="flex items-center justify-between">
                <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#f7c600]">
                  <Ticket size={14} aria-hidden="true" /> Autres matchs
                </p>
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#f7c600]/15 px-1.5 text-[11px] font-black text-[#f7c600]">
                  {otherMatches.length}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {otherMatches.map((match) => (
                  <article
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.05] p-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-[#f7c600]/45 hover:bg-white/[0.09]"
                    key={match.team + "-" + match.away}
                  >
                    <span className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-[#f7c600] transition-transform duration-200 group-hover:scale-y-100" aria-hidden="true" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-[#f7c600]/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#f7c600]">
                        {match.team}
                      </span>
                      <span className="text-[10px] font-black uppercase text-white/55">{match.time}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm font-bold">
                      {crest(match.home, "sm")}
                      <span className="min-w-0 flex-1 truncate">{shortTeam(match.home)}</span>
                      <span className="shrink-0 text-[10px] font-black uppercase text-[#f7c600]">vs</span>
                      <span className="min-w-0 flex-1 truncate text-right">{shortTeam(match.away)}</span>
                      {crest(match.away, "sm")}
                    </div>
                    <p className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-white/55">
                      <CalendarDays className="shrink-0 text-[#f7c600]/80" size={12} aria-hidden="true" />
                      {match.date} · {match.place}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Actualité à la une : carte éditoriale premium ── */}
        <article className="official-card group flex flex-col overflow-hidden rounded-3xl bg-white">
          <div className="relative h-60 overflow-hidden sm:h-80">
            <Image
              src={leadNews.image}
              alt={leadNews.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001c10]/85 via-[#001c10]/15 to-transparent" aria-hidden="true" />
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#002f1d]/90 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#f7c600] ring-1 ring-[#f7c600]/30 backdrop-blur">
              <Sparkles size={12} aria-hidden="true" /> À la une
            </span>
            <p className="absolute inset-x-4 bottom-4 text-[11px] font-black uppercase tracking-[0.18em] text-white/90">
              {leadNews.category} · {leadNews.date}
            </p>
          </div>
          <div className="flex flex-1 flex-col p-6 sm:p-7">
            <h3 className="text-2xl font-black uppercase leading-tight text-[#002f1d] transition-colors group-hover:text-[#064b2d] sm:text-[1.7rem]">
              {leadNews.title}
            </h3>
            <p className="mt-3 leading-7 text-slate-700">{leadNews.excerpt}</p>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-6">
              <ButtonLink href="/actualites" variant="dark">Lire l'article</ButtonLink>
              <Link
                href="/actualites"
                className="focus-ring inline-flex items-center gap-1 text-xs font-black uppercase tracking-wide text-[#8a6d00] transition hover:text-[#002f1d]"
              >
                Toutes les actus
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </article>
      </section>

      <section className="bg-[#f7f8f4] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle eyebrow="Équipes" title="Une famille, plusieurs ambitions" text="De l'école de foot aux Seniors : chaque catégorie porte le même blason, avec un accompagnement adapté." />
            <div className="pb-2">
              <ButtonLink href="/equipes" variant="dark">Voir toutes les équipes</ButtonLink>
            </div>
          </div>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {teams.slice(0, 5).map((team) => (
              <StaggerItem key={team.slug}>
                <Link className="focus-ring premium-card group flex h-full flex-col overflow-hidden rounded-xl bg-white" href={`/equipes/${team.slug}`}>
                  <div className="relative h-36">
                    <Image src={team.image} alt={team.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 20vw" className="object-cover" />
                    <span className="absolute left-3 top-3 z-[1] rounded-full bg-[#002f1d]/85 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#f7c600] backdrop-blur">{team.category}</span>
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-2 p-4">
                    <h3 className="text-base font-black uppercase leading-tight text-[#002f1d]">{team.name}</h3>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f7c600] text-[#002f1d] transition group-hover:translate-x-0.5">
                      <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="image-tint grid min-h-[380px] overflow-hidden rounded-lg text-white lg:grid-cols-[1fr_0.85fr]">
          <Image src={images.youthTeam} alt="" fill sizes="100vw" className="object-cover object-center" style={{ zIndex: 0 }} />
          <div className="flex flex-col justify-end p-6 sm:p-8">
            <p className="text-sm font-black uppercase text-[#f7c600]">Inscriptions 2025 / 2026</p>
            <h2 className="mt-2 max-w-2xl text-4xl font-black uppercase leading-tight sm:text-5xl">Rejoignez la famille Viry !</h2>
            <p className="mt-4 max-w-xl text-lg text-white/85">École de foot, préformation, formation, compétitions : il y a une place pour chacun.</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <ButtonLink href="/inscriptions">Je m'inscris en ligne</ButtonLink>
              <ButtonLink href="/detections-recrutement" variant="outline">
                Détections
              </ButtonLink>
            </div>
          </div>
          <div className="hidden items-end justify-center p-8 lg:flex">
            <div className="rounded-lg border border-[#f7c600]/35 bg-[#001c10]/65 p-5 text-center backdrop-blur">
              <Trophy className="mx-auto text-[#f7c600]" size={54} aria-hidden="true" />
              <p className="mt-3 text-xl font-black uppercase">Former aujourd'hui</p>
              <p className="text-sm text-white/75">Préparer demain</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle eyebrow="Actualités" title="Dernières actualités" text="Résultats, stages, détections et temps forts : toute la vie du club." />
          <div className="pb-2">
            <ButtonLink href="/actualites" variant="dark">Voir toutes les actualités</ButtonLink>
          </div>
        </div>
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {gridNews.map((item) => (
            <StaggerItem key={item.title}>
              <Link className="focus-ring premium-card flex h-full flex-col overflow-hidden rounded-xl bg-white" href="/actualites">
                <div className="relative h-40 w-full">
                  <Image src={item.image} alt={item.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[11px] font-black uppercase text-[#8a6d00]">{item.category} · {item.date}</p>
                  <h3 className="mt-1.5 text-lg font-black uppercase leading-tight text-[#002f1d]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{item.excerpt}</p>
                  <p className="mt-auto pt-4 text-xs font-black uppercase text-[#002f1d]">Lire l'article →</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle
              eyebrow="Partenaires"
              text="Un club sérieux, stable et ambitieux : associez votre image à un acteur majeur du territoire."
              title="Ils accompagnent le projet"
            />
            <div className="lg:pb-9">
              <ButtonLink href="/partenaires" variant="dark">
                Devenir partenaire
              </ButtonLink>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-[#002f1d]/10 py-4 text-xs font-black uppercase tracking-wide text-[#8a6d00]">
            <span className="inline-flex items-center gap-2">
              <Handshake size={16} aria-hidden="true" />
              Partenaires institutionnels &amp; officiels
            </span>
            <span className="hidden h-3 w-px bg-[#002f1d]/15 sm:inline-block" aria-hidden="true" />
            <span className="inline-flex items-center gap-2 text-[#002f1d]/70">
              <Sparkles size={16} className="text-[#f7c600]" aria-hidden="true" />
              Un territoire qui soutient son club
            </span>
          </div>

          <Stagger className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {partners.slice(0, 8).map((partner, index) => {
              const TIERS: Record<string, string> = {
                "Essonne Département": "Institutionnel",
                "Ville de Viry-Châtillon": "Institutionnel",
                Intersport: "Partenaire officiel",
                "E.Leclerc": "Partenaire officiel",
                Engie: "Partenaire officiel",
                "Crédit Mutuel": "Partenaire officiel",
                Nike: "Équipementier",
                Adidas: "Équipementier"
              };
              const tier = TIERS[partner] ?? "Partenaire officiel";
              const isInstitutionnel = tier === "Institutionnel";

              const MONOGRAM_OVERRIDES: Record<string, string> = {
                "Ville de Viry-Châtillon": "VC",
                "Essonne Département": "ED",
                "E.Leclerc": "EL",
                "Crédit Mutuel": "CM"
              };
              const STOP_WORDS = new Set(["de", "du", "des", "la", "le", "les", "et", "d"]);
              const derivedMonogram = partner
                .replace(/[^A-Za-zÀ-ÿ]+/g, " ")
                .split(/\s+/)
                .filter((word) => word && !STOP_WORDS.has(word.toLowerCase()))
                .slice(0, 2)
                .map((word) => word[0].toUpperCase())
                .join("");
              const monogram = MONOGRAM_OVERRIDES[partner] ?? derivedMonogram;

              return (
                <StaggerItem key={partner}>
                  <article
                    className="premium-card group relative flex h-full flex-col items-center justify-center overflow-hidden rounded-xl px-5 py-7 text-center"
                    title={partner}
                  >
                    <span
                      className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#f7c600]/0 blur-2xl transition-all duration-300 group-hover:bg-[#f7c600]/15"
                      aria-hidden="true"
                    />
                    <span
                      className="pointer-events-none absolute right-3 top-2 text-[11px] font-black tabular-nums text-[#002f1d]/15 transition-colors duration-200 group-hover:text-[#8a6d00]/40"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`relative mb-4 flex h-16 w-16 items-center justify-center rounded-full shadow-[0_10px_24px_rgba(0,31,19,0.22)] transition-all duration-300 group-hover:shadow-[0_14px_30px_rgba(0,31,19,0.3)] ${
                        isInstitutionnel
                          ? "bg-gradient-to-br from-[#f7c600] to-[#8a6d00] ring-1 ring-[#8a6d00]/30 group-hover:ring-[#f7c600]"
                          : "bg-gradient-to-br from-[#00351f] to-[#001c10] ring-1 ring-[#f7c600]/30 group-hover:ring-[#f7c600]"
                      }`}
                      aria-hidden="true"
                    >
                      <span className="absolute inset-1.5 rounded-full ring-1 ring-inset ring-white/10" />
                      <span
                        className={`text-lg font-black uppercase tracking-tight ${
                          isInstitutionnel ? "text-[#002f1d]" : "text-[#f7c600]"
                        }`}
                      >
                        {monogram}
                      </span>
                    </span>
                    <h3 className="text-sm font-black uppercase leading-tight text-[#002f1d]">{partner}</h3>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#8a6d00]">
                      <BadgeCheck size={13} aria-hidden="true" />
                      {tier}
                    </p>
                    <span
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#f7c600] transition-transform duration-300 group-hover:scale-x-100"
                      aria-hidden="true"
                    />
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>

          <div className="mt-8 flex flex-col items-center gap-4 rounded-xl bg-[#f7f8f4] px-6 py-7 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="max-w-xl text-base font-bold text-slate-700">
              Et si votre marque rejoignait le mouvement ?{" "}
              <span className="font-black text-[#002f1d]">Votre image a toute sa place à nos côtés.</span>
            </p>
            <a
              href="/partenaires"
              className="focus-ring inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-black uppercase text-[#002f1d] underline decoration-[#f7c600] decoration-2 underline-offset-4 transition hover:text-[#00351f]"
            >
              Découvrir nos offres
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="club-shell py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Nos valeurs"
            inverse
            text="Des repères simples pour grandir ensemble, sur le terrain et autour du terrain."
            title="L'esprit du club"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {values.map((value) => {
              const Icon = iconByName(value.iconName);
              return (
                <article className="rounded-lg border border-[#f7c600]/35 bg-white/5 p-5" key={value.title}>
                  <Icon className="text-[#f7c600]" size={38} aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-black uppercase text-white">{value.title}</h3>
                  <p className="mt-2 text-sm text-white/75">{value.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
