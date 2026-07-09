import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Clock, Flag, Handshake, HeartHandshake, MapPin, Sparkles, Ticket, Trophy, Users } from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { HomeHeroCarousel, type HomeHeroSlide } from "@/components/HomeHeroCarousel";
import { Stagger, StaggerItem } from "@/components/Motion";
import { PartnerLogoMarquee, type PartnerLogo } from "@/components/PartnerLogoMarquee";
import { SectionTitle } from "@/components/SectionTitle";
import { matches } from "@/lib/data";
import { iconByName } from "@/lib/icon-map";
import { images } from "@/lib/images";
import { getPartnerLogo } from "@/lib/partner-logos";
import { getPublicNews, getPublicPartners, getSiteSettings, type DisplayPartner } from "@/lib/public-content";
import { jsonLdScript } from "@/lib/jsonld";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata = {
  alternates: { canonical: "/" }
};

export const revalidate = 300; // ISR : contenu CMS rafraichi toutes les 5 min

// JSON-LD WebSite (uniquement sur l'accueil) : aide Google a afficher le nom du site.
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ES Viry-Châtillon Football",
  url: siteUrl,
  inLanguage: "fr-FR"
};

const heroSlides: HomeHeroSlide[] = [
  { src: images.stadiumHero, objectPosition: "center 90%" },
  { src: images.stadeTribune, objectPosition: "center center" },
  { src: images.stadeTribune2, objectPosition: "center center" },
  { src: images.teamHuddle, objectPosition: "center 48%" },
  { src: images.youthTeam, objectPosition: "center 45%" },
  { src: images.training, objectPosition: "center 45%" },
  { src: images.football, objectPosition: "center 50%" },
  { src: images.pitch, objectPosition: "center 46%" },
  { src: images.supporters, objectPosition: "center 42%" }
];

function toPartnerLogo(partner: DisplayPartner): PartnerLogo {
  return {
    name: partner.name,
    logo: partner.logoUrl ?? getPartnerLogo(partner.name),
    alt: `Logo ${partner.name}`
  };
}

export default async function HomePage() {
  const [allNews, settings, featuredPartners] = await Promise.all([getPublicNews(5), getSiteSettings(), getPublicPartners()]);
  const partnerLogos = featuredPartners.map(toPartnerLogo);
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
  const mobileActions = [
    ["Inscriptions", "/inscriptions"],
    ["Calendrier", "/calendrier"],
    ["Équipes", "/equipes"],
    ["Boutique", "/boutique"]
  ];

  const nextMatch = matches[0];
  const otherMatches = matches.slice(1);
  const homeMatches = [nextMatch, ...otherMatches].slice(0, 3);
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
  // Écusson : UNE coquille commune (verre sombre + cerclage or fin) pour les deux camps.
  // Le logo club entre en object-contain ; l'adversaire sans logo affiche son monogramme
  // en LETTRES OR sur le même fond — jamais un disque jaune plein (équilibre garanti).
  const crest = (name: string, size: "sm" | "lg") => {
    const dim = size === "lg" ? "h-16 w-16 sm:h-[84px] sm:w-[84px]" : "h-9 w-9";
    const shell = `${dim} shrink-0 rounded-full bg-[#001c10]/65 backdrop-blur-sm ring-1 ring-[#f7c600]/55 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.12),0_8px_24px_-8px_rgba(0,0,0,0.55)]`;
    return isClub(name) ? (
      <img
        src="/club-logo.svg"
        alt=""
        aria-hidden="true"
        className={`${shell} object-contain ${size === "lg" ? "p-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" : "p-1"}`}
        width={84}
        height={84}
      />
    ) : (
      <span
        aria-hidden="true"
        className={`${shell} flex items-center justify-center font-black tracking-tight text-[#ffd84d] ${size === "lg" ? "text-xl sm:text-3xl" : "text-[11px]"}`}
      >
        {teamInitials(name)}
      </span>
    );
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd) }} />
      <section className="bg-[#f7f8f4] xl:hidden">
        <div className="relative isolate flex min-h-[calc(86svh_-_var(--header-h,0px))] flex-col justify-end overflow-hidden px-4 pb-6 pt-8 text-white">
          <Image src={images.stadiumHero} alt="" fill sizes="100vw" priority className="object-cover object-[center_82%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001c10]/95 via-[#001c10]/45 to-[#001c10]/20" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#001c10] to-transparent" aria-hidden="true" />

          <div className="relative z-[1]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f7c600]">ES Viry-Châtillon</p>
            <h1 className="mt-3 max-w-[22rem]">
              <span className="font-script block text-[4.45rem] leading-[0.9] text-[#f7c600] drop-shadow-[0_4px_14px_rgba(0,0,0,0.55)] min-[390px]:text-[4.95rem]">
                Une passion
              </span>
              <span className="font-script -mt-1 block pl-3 text-[4.45rem] leading-[0.9] text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.55)] min-[390px]:text-[4.95rem]">
                notre force
              </span>
            </h1>
            <div className="mt-5 h-1 w-20 rounded-full bg-[#f7c600]" />
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#f7c600] px-3 text-xs font-black uppercase text-[#001c10]" href="/inscriptions">
                Rejoindre <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/65 bg-black/10 px-3 text-xs font-black uppercase text-white backdrop-blur" href="/equipes">
                Nos équipes <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-4 py-5">
          <div className="grid grid-cols-2 gap-3">
            {mobileActions.map(([label, href]) => (
              <Link key={href} href={href} className="focus-ring rounded-lg border border-[#002f1d]/10 bg-white px-4 py-4 shadow-sm">
                <span className="block text-sm font-black uppercase text-[#002f1d]">{label}</span>
              </Link>
            ))}
          </div>

          <article className="rounded-lg bg-[#002f1d] p-5 text-white shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-[#f7c600]">Prochain match</p>
            <h2 className="mt-2 text-2xl font-black uppercase">{nextMatch.team}</h2>
            <p className="mt-3 text-base font-black">
              {shortTeam(nextMatch.home)} vs {shortTeam(nextMatch.away)}
            </p>
            <p className="mt-1 text-sm font-bold text-white/75">
              {nextMatch.date} · {nextMatch.time}
            </p>
            <Link href="/calendrier" className="focus-ring mt-4 inline-flex min-h-10 items-center gap-2 rounded-md bg-[#f7c600] px-4 text-xs font-black uppercase text-[#001c10]">
              Calendrier <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </article>

          {leadNews ? (
            <Link href={`/actualites/${leadNews.slug}`} className="focus-ring block overflow-hidden rounded-lg bg-white shadow-sm">
              <div className="relative h-40">
                <Image src={leadNews.image} alt={leadNews.title} fill sizes="100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001c10]/75 to-transparent" aria-hidden="true" />
                <span className="absolute left-3 top-3 rounded-full bg-[#002f1d]/90 px-3 py-1 text-[11px] font-black uppercase text-[#f7c600]">
                  À la une
                </span>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-black uppercase leading-tight text-[#002f1d]">{leadNews.title}</h2>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-black uppercase text-[#664d00]">
                  Lire <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      <div className="hidden xl:block">
      <section className="hero-stadium relative isolate flex min-h-[calc(100svh_-_var(--header-h,0px))] flex-col overflow-hidden border-b border-[#f7c600]/35 text-white sm:min-h-[640px] lg:h-[calc(100svh_-_var(--header-h))] lg:min-h-0 3xl:min-h-[760px]">
        <HomeHeroCarousel slides={heroSlides} />
        {/* Contenu principal (centré, occupe l'espace disponible) */}
        <div className="relative z-[2] mx-auto flex w-full max-w-[1720px] flex-1 items-center px-4 py-8 sm:px-6 lg:px-8 lg:py-8 3xl:max-w-[1920px] 3xl:px-10">
          <div className="w-full max-w-4xl 3xl:max-w-5xl">
            {/* Hero above-the-fold rendu en HTML statique (pas de framer-motion) :
                le LCP ne depend plus de l'hydratation JS. */}
            <div>
              <h1 className="max-w-4xl">
                <span className="font-script block text-[4.25rem] leading-[0.95] text-[#f7c600] drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)] min-[390px]:text-[4.65rem] sm:text-7xl lg:text-7xl xl:text-8xl 2xl:text-8xl 3xl:text-9xl">
                  Une passion
                </span>
                <span className="font-script -mt-1 block pl-3 text-[4.25rem] leading-[0.95] text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)] min-[390px]:text-[4.65rem] sm:pl-6 sm:text-7xl lg:text-7xl xl:text-8xl 2xl:text-8xl 3xl:text-9xl">
                  notre force
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white/90 sm:text-lg">
                Porté par un nouveau bureau nouvellement nommé, notre club ouvre un nouveau chapitre.
              </p>
              <div className="mt-4 h-1 w-24 rounded-full bg-[#f7c600]" />
              <div className="mt-7 flex flex-col gap-3 min-[430px]:flex-row sm:flex-wrap sm:gap-4">
                <Link className="focus-ring inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-[#f7c600] px-5 py-3 text-xs font-black uppercase text-[#001c10] shadow-[0_18px_34px_rgba(247,198,0,0.28)] transition hover:-translate-y-0.5 hover:bg-white sm:gap-4 sm:px-7 sm:py-3.5 sm:text-sm" href="/le-club">
                  Découvrir le club
                  <ArrowRight size={22} aria-hidden="true" />
                </Link>
                <Link className="focus-ring inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border border-white/70 bg-black/10 px-5 py-3 text-xs font-black uppercase text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-[#f7c600] hover:text-[#f7c600] sm:gap-4 sm:px-7 sm:py-3.5 sm:text-sm" href="/equipes">
                  Nos équipes
                  <ArrowRight size={22} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Barre statistiques : tout en bas du hero, compacte, une seule ligne par carte */}
        <div className="relative z-[2] mx-auto w-full max-w-[1560px] shrink-0 px-4 pb-4 sm:px-6 lg:px-8 lg:pb-5 3xl:max-w-[1800px] 3xl:px-10">
          <Stagger
            aria-label="Chiffres clés du club"
            role="group"
            className="grid max-h-[30svh] overflow-y-auto rounded-xl border border-white/15 bg-[#00150d]/75 shadow-[0_22px_55px_rgba(0,18,11,0.5)] ring-1 ring-[#f7c600]/10 backdrop-blur-xl min-[520px]:max-h-none sm:grid-cols-2 lg:grid-cols-5"
          >
            {clubStats.map((stat) => {
              const Icon = iconByName(stat.iconName);
              return (
                <StaggerItem
                  className="group flex items-center gap-3 border-b border-white/10 px-4 py-3 transition last:border-b-0 hover:bg-white/[0.05] sm:border-b-0 sm:border-r sm:last:border-r-0"
                  key={stat.label}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f7c600]/12 text-[#f7c600] ring-1 ring-[#f7c600]/25 transition group-hover:bg-[#f7c600]/20" aria-hidden="true">
                    <Icon size={19} strokeWidth={2} />
                  </span>
                  <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                    <span className="text-lg font-black uppercase leading-none text-white">{stat.value}</span>
                    <span className="text-[13px] font-black uppercase leading-none tracking-wide text-white/70">{stat.label}</span>
                  </p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 3xl:gap-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <StaggerItem key={action.label}>
                <Link
                  href={action.href}
                  className="focus-ring premium-card group relative flex h-full items-center gap-4 overflow-hidden rounded-2xl bg-white p-5"
                >
                  <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[#f7c600] transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00351f] to-[#001c10] text-[#f7c600] ring-1 ring-[#f7c600]/30 transition duration-300 group-hover:scale-105 group-hover:ring-[#f7c600]" aria-hidden="true">
                    <Icon size={24} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black uppercase tracking-wide text-[#664d00]">Accès rapide</p>
                    <h2 className="mt-1 text-lg font-black uppercase leading-tight text-[#002f1d]">{action.label}</h2>
                    <p className="mt-1 text-sm font-bold text-slate-600">{action.text}</p>
                  </div>
                  <ArrowUpRight size={18} className="shrink-0 text-[#002f1d]/30 transition duration-300 group-hover:translate-x-0.5 group-hover:text-[#f7c600]" aria-hidden="true" />
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      <section className="mx-auto grid max-w-7xl items-stretch gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 3xl:grid-cols-[1.18fr_0.82fr] 3xl:gap-8">
        {/* ── Prochains matchs : affichage compact en liste ── */}
        <div className="club-panel relative overflow-hidden rounded-3xl p-5 text-white sm:p-7">
          <div className="stadium-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#f7c600]/20 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#0a6b3d]/45 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="inline-flex items-center gap-3 text-2xl font-black uppercase leading-none text-white sm:text-3xl">
                <Ticket size={24} className="text-[#f7c600]" aria-hidden="true" />
                Prochains matchs
              </h2>
              <Link
                href="/calendrier"
                className="focus-ring inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#f7c600] transition hover:text-white"
              >
                Voir le calendrier <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-6 grid gap-4">
              {homeMatches.map((match, index) => (
                <article
                  className={`grid gap-4 rounded-2xl border bg-white/[0.06] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/[0.09] sm:grid-cols-[minmax(0,1fr)_minmax(13rem,0.72fr)] ${
                    index === homeMatches.length - 1 ? "border-[#f7c600]/55" : "border-white/12 hover:border-[#f7c600]/45"
                  }`}
                  key={match.team + "-" + match.away}
                  aria-label={`${match.team} : ${shortTeam(match.home)} contre ${shortTeam(match.away)} — ${match.date} à ${match.time}`}
                >
                  <div className="min-w-0">
                    <span className="inline-flex rounded-md bg-[#f7c600] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#001c10]">
                      {match.team}
                    </span>
                    <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-5">
                      <div className="min-w-0 text-center">
                        <div className="mx-auto w-fit">{crest(match.home, "sm")}</div>
                        <p className="mt-2 truncate text-base font-black uppercase text-white sm:text-lg">{shortTeam(match.home)}</p>
                      </div>
                      <span className="text-lg font-black uppercase text-[#f7c600]">VS</span>
                      <div className="min-w-0 text-center">
                        <div className="mx-auto w-fit">{crest(match.away, "sm")}</div>
                        <p className="mt-2 truncate text-base font-black uppercase text-white sm:text-lg">{shortTeam(match.away)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center rounded-xl border border-white/10 bg-[#00120b]/35 p-4">
                    <p className="inline-flex items-center gap-2 text-base font-black text-white">
                      <CalendarDays size={18} className="shrink-0 text-[#f7c600]" aria-hidden="true" />
                      {match.date}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-2 text-3xl font-black leading-none text-white">
                      <Clock size={20} className="shrink-0 text-[#f7c600]" aria-hidden="true" />
                      {match.time}
                    </p>
                    <p className="mt-3 inline-flex items-start gap-2 text-sm font-bold leading-5 text-white/75">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-[#f7c600]" aria-hidden="true" />
                      {match.place}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <Link
              href="/calendrier"
              className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] py-3 text-sm font-black uppercase text-white transition hover:-translate-y-0.5 hover:border-[#f7c600] hover:text-[#f7c600]"
            >
              Voir tous les matchs <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* ── Actualité à la une : carte éditoriale premium ── */}
        <article className="premium-card group flex flex-col overflow-hidden rounded-3xl bg-white">
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
            <h3 className="text-2xl font-black uppercase leading-tight text-[#002f1d] transition-colors group-hover:text-[#064b2d] sm:text-3xl">
              {leadNews.title}
            </h3>
            <p className="mt-3 leading-7 text-slate-700">{leadNews.excerpt}</p>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-6">
              <ButtonLink href={`/actualites/${leadNews.slug}`} variant="dark">Lire l'article</ButtonLink>
              <Link
                href="/actualites"
                className="focus-ring inline-flex items-center gap-1 text-xs font-black uppercase tracking-wide text-[#664d00] transition hover:text-[#002f1d]"
              >
                Toutes les actus
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-3xl border border-[#f7c600]/20 text-white shadow-[0_30px_70px_rgba(0,18,11,0.45)]">
          <Image src={images.youthTeam} alt="" fill sizes="100vw" className="object-cover object-center" style={{ zIndex: 0 }} />
          {/* Overlays : profondeur + lisibilité */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#001c10]/92 via-[#001c10]/70 to-[#001c10]/20" aria-hidden="true" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#001c10]/80 to-transparent" aria-hidden="true" />
          <div className="stadium-grid pointer-events-none absolute inset-0 z-[1] opacity-40" aria-hidden="true" />
          <div className="relative z-[2] grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
            <div>
              <p className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f7c600]/12 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#f7c600] ring-1 ring-[#f7c600]/30">
                Inscriptions 2025 / 2026
              </p>
              <h2 className="mt-4 max-w-2xl text-4xl font-black uppercase leading-[0.95] sm:text-5xl">
                Rejoignez la <span className="text-[#f7c600]">famille Viry</span>
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-7 text-white/85">École de foot, préformation, formation, compétitions : il y a une place pour chacun.</p>
              <div className="mt-7 flex flex-wrap gap-4">
                <ButtonLink href="/inscriptions">Je m'inscris en ligne</ButtonLink>
                <ButtonLink href="/detections-recrutement" variant="outline">Détections</ButtonLink>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-[#f7c600]/35 bg-[#001c10]/70 p-6 backdrop-blur-md sm:p-7">
              <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#f7c600]/15 blur-3xl" aria-hidden="true" />
              <Trophy className="text-[#f7c600]" size={42} aria-hidden="true" />
              <p className="mt-4 text-2xl font-black uppercase leading-tight">Former aujourd'hui</p>
              <p className="text-2xl font-black uppercase leading-tight text-[#f7c600]">Préparer demain</p>
              <p className="mt-3 text-sm leading-6 text-white/80">Un encadrement diplômé et un vrai projet de jeu, de l'école de foot aux seniors.</p>
            </div>
          </div>
        </div>
      </section>

      {gridNews.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle eyebrow="Actualités" title="Dernières actualités" text="Résultats, stages, détections et temps forts : toute la vie du club." />
            <div className="pb-2">
              <ButtonLink href="/actualites" variant="dark">Voir toutes les actualités</ButtonLink>
            </div>
          </div>
          <div className={`grid gap-6 ${gridNews.length > 1 ? "lg:grid-cols-[1.45fr_1fr]" : ""}`}>
            {/* Actu phare */}
            <Link
              href={`/actualites/${gridNews[0].slug}`}
              className="focus-ring premium-card group relative flex min-h-[20rem] flex-col justify-end overflow-hidden rounded-2xl"
            >
              <Image
                src={gridNews[0].image}
                alt={gridNews[0].title}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001c10]/92 via-[#001c10]/35 to-transparent" aria-hidden="true" />
              <div className="relative p-6 sm:p-8">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#f7c600]">{gridNews[0].category} · {gridNews[0].date}</p>
                <h3 className="mt-2 text-2xl font-black uppercase leading-tight text-white sm:text-3xl">{gridNews[0].title}</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/80 line-clamp-2">{gridNews[0].excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#f7c600]">
                  Lire l'article <ArrowUpRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>

            {/* Actus secondaires */}
            {gridNews.length > 1 ? (
              <div className="grid content-start gap-4">
                {gridNews.slice(1, 4).map((item) => (
                  <Link
                    key={item.title}
                    href={`/actualites/${item.slug}`}
                    className="focus-ring premium-card group flex gap-4 overflow-hidden rounded-2xl bg-white p-3"
                  >
                    <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl">
                      <Image src={item.image} alt={item.title} fill sizes="160px" className="object-cover transition-transform duration-500 group-hover:scale-[1.06]" />
                    </div>
                    <div className="min-w-0 flex-1 py-1">
                      <p className="text-[10px] font-black uppercase text-[#664d00]">{item.category} · {item.date}</p>
                      <h3 className="mt-1 text-base font-black uppercase leading-tight text-[#002f1d] line-clamp-2">{item.title}</h3>
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-black uppercase text-[#002f1d] transition group-hover:text-[#07542f]">
                        Lire <ArrowUpRight size={12} aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
      </div>

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

          <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-[#002f1d]/10 py-4 text-xs font-black uppercase tracking-wide text-[#664d00]">
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

          <PartnerLogoMarquee partners={partnerLogos} />
        </div>
      </section>

      <div className="hidden xl:block">
      <section className="club-shell py-14 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Nos valeurs"
            inverse
            text="Des repères simples pour grandir ensemble, sur le terrain et autour du terrain."
            title="L'esprit du club"
          />
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {values.map((value) => {
              const Icon = iconByName(value.iconName);
              return (
                <StaggerItem key={value.title} className="h-full">
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#f7c600]/25 bg-white/[0.05] p-6 shadow-[0_14px_34px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-[#f7c600]/60 hover:bg-white/[0.08] hover:shadow-[0_20px_44px_rgba(0,0,0,0.35)]">
                    <span className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#f7c600]/0 blur-2xl transition-all duration-300 group-hover:bg-[#f7c600]/15" aria-hidden="true" />
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7c600]/12 text-[#f7c600] ring-1 ring-[#f7c600]/30 transition duration-300 group-hover:scale-105" aria-hidden="true">
                      <Icon size={28} />
                    </span>
                    <h3 className="mt-5 text-lg font-black uppercase text-white">{value.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-white/85">{value.text}</p>
                    <span className="mt-5 block h-0.5 w-8 rounded-full bg-[#f7c600]/40 transition-all duration-300 group-hover:w-14 group-hover:bg-[#f7c600]" aria-hidden="true" />
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>
      </div>
    </>
  );
}
