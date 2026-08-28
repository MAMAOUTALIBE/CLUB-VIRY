import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Clock, MapPin, Sparkles, Ticket } from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { HomeLiveGallery } from "@/components/HomeLiveGallery";
import { HomeHeroCarousel } from "@/components/HomeHeroCarousel";
import { HomeSportsHub } from "@/components/HomeSportsHub";
import { MobileDailyProgram } from "@/components/MobileDailyProgram";
import { MobileLiveResults } from "@/components/MobileLiveResults";
import { Stagger, StaggerItem } from "@/components/Motion";
import { SectionTitle } from "@/components/SectionTitle";
import { getCalendarPageData, getMobileMatchFeed, getTodayCalendarItems } from "@/lib/calendar-view";
import { iconByName } from "@/lib/icon-map";
import { images } from "@/lib/images";
import { selectHomeMediaCard } from "@/lib/home-media-card";
import { getPartnerLogo } from "@/lib/partner-logos";
import { getHomepageVideoMedia, getLatestPublishedGalleryPhotos, getPublicNews, getPublicPartners, getSiteSettings, type DisplayPartner } from "@/lib/public-content";
import { jsonLdScript } from "@/lib/jsonld";
import type { RecentResult, UpcomingMatch } from "@/lib/home-sports-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata = {
  alternates: { canonical: "/" }
};

export const dynamic = "force-dynamic"; // CRM : partenaires et contenus lus en production à chaque requête

// JSON-LD WebSite (uniquement sur l'accueil) : aide Google a afficher le nom du site.
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ES Viry-Châtillon Football",
  url: siteUrl,
  inLanguage: "fr-FR"
};

const institutionalPartnerNames = ["Essonne Département", "Ville de Viry-Châtillon"] as const;

function getInstitutionalPartners(partners: DisplayPartner[]): DisplayPartner[] {
  return institutionalPartnerNames.map((name) => {
    const partner = partners.find((item) => item.name === name);
    return partner ?? { name, logoUrl: getPartnerLogo(name), websiteUrl: null, tier: null };
  });
}

function InstitutionalPartnerCard({ partner, className, interactive = true }: { partner: DisplayPartner; className: string; interactive?: boolean }) {
  const logoUrl = partner.logoUrl ?? getPartnerLogo(partner.name);
  const content = (
    <>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={`Logo ${partner.name}`}
          className="h-14 w-full object-contain sm:h-20 lg:h-24"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="text-center text-base font-black uppercase text-[#002f1d] sm:text-xl">{partner.name}</span>
      )}
      <span className="mt-3 text-center text-xs font-bold leading-tight text-[#002f1d] sm:mt-4 sm:text-base">
        {partner.name === "Essonne Département" ? "Département de l’Essonne" : partner.name}
      </span>
    </>
  );

  return interactive && partner.websiteUrl ? (
    <a href={partner.websiteUrl} className={className} target="_blank" rel="noreferrer">
      {content}
    </a>
  ) : (
    <article className={className}>{content}</article>
  );
}

export default async function HomePage() {
  const now = new Date();
  const [allNews, settings, featuredPartners, calendar, todayCalendarItems, mobileMatchFeed, latestGalleryPhotos, homepageVideoMedia] = await Promise.all([
    getPublicNews(5),
    getSiteSettings(),
    getPublicPartners(),
    getCalendarPageData(),
    getTodayCalendarItems(now),
    getMobileMatchFeed(),
    getLatestPublishedGalleryPhotos(4),
    getHomepageVideoMedia()
  ]);
  const homepageMedia = selectHomeMediaCard(mobileMatchFeed.live, homepageVideoMedia, now);
  const institutionalPartners = getInstitutionalPartners(featuredPartners);
  const leadNews = allNews[0];
  const gridNews = allNews.slice(1, 5);
  const clubStats = settings.club_stats;
  const values = settings.values;
  const heroSlides = settings.homeHero;
  // Prochains matchs : depuis le calendrier DB (matchs publiés), avec repli sur le mock
  // partagé via getCalendarPageData — même contenu qu'auparavant en mode vitrine.
  const homeMatches = calendar.items
    .filter((item) => item.kind === "match" && item.status !== "FINISHED" && item.status !== "CANCELLED")
    .slice(0, 3)
    .map((item) => ({ team: item.title, home: item.home ?? "ES Viry", away: item.away ?? "", date: item.dateLabel, time: item.timeLabel, place: item.place }));
  const sportsMatches: UpcomingMatch[] = homeMatches.map((match) => ({ category: match.team, home: match.home, away: match.away, date: match.date, time: match.time, venue: match.place ?? "" }));
  const sportsResults: RecentResult[] = calendar.items
    .filter((item) => item.kind === "match" && item.status === "FINISHED" && item.homeScore != null && item.awayScore != null)
    .slice(-3)
    .reverse()
    .map((item) => ({ category: item.title, home: item.home ?? "ES Viry", away: item.away ?? "", homeScore: item.homeScore as number, awayScore: item.awayScore as number, date: item.dateLabel, venue: item.place ?? "" }));
  const isClub = (name: string) => name.toLowerCase().includes("viry");
  const shortTeam = (name: string) => (isClub(name) ? "ES Viry" : name);
  const teamInitials = (name: string) => name.replace(/^ES\s+/i, "").split(/[\s-]+/).filter(Boolean).map((word) => word[0]).join("").slice(0, 3).toUpperCase();
  const crest = (name: string, size: "sm" | "lg") => {
    const dim = size === "lg" ? "h-16 w-16 sm:h-[84px] sm:w-[84px]" : "h-9 w-9";
    const shell = `${dim} shrink-0 rounded-full bg-[#001c10]/65 ring-1 ring-[#f7c600]/55`;
    return isClub(name) ? <img src="/club-logo.svg" alt="" aria-hidden="true" className={`${shell} object-contain p-1`} width={84} height={84} /> : <span aria-hidden="true" className={`${shell} flex items-center justify-center text-[11px] font-black text-[#ffd84d]`}>{teamInitials(name)}</span>;
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd) }} />
      <section className="bg-[#f7f8f4] xl:hidden">
        <div className="relative isolate min-h-[calc(88svh_-_var(--header-h,0px))] overflow-hidden text-white sm:min-h-[680px]">
          <HomeHeroCarousel slides={heroSlides} variant="mobile" />
        </div>

        <MobileDailyProgram items={todayCalendarItems} now={now} />
        <MobileLiveResults live={mobileMatchFeed.live} results={mobileMatchFeed.results} />
      </section>

      <div className="hidden xl:block">
      <section className="hero-stadium relative isolate flex min-h-[calc(100svh_-_var(--header-h,0px))] flex-col overflow-hidden border-b border-[#f7c600]/35 text-white sm:min-h-[640px] lg:h-[calc(100svh_-_var(--header-h))] lg:min-h-0 3xl:min-h-[760px]">
        <HomeHeroCarousel slides={heroSlides} />
        <div className="flex-1" aria-hidden="true" />

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

      <HomeSportsHub matches={sportsMatches} results={calendar.isFallback ? undefined : sportsResults} schedule={settings.homeSports.trainingSchedule} weekLabel={settings.homeSports.weekLabel} />

      </div>

      <HomeLiveGallery media={homepageMedia} photos={latestGalleryPhotos} />

      {gridNews.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 xl:py-14">
          <Link
            href="/actualites"
            className="focus-ring mb-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#664d00] transition hover:text-[#002f1d] xl:hidden"
          >
            Actualités <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <div className="mb-8 hidden flex-col gap-4 xl:flex xl:flex-row xl:items-end xl:justify-between">
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

      <section className="bg-white py-8 sm:py-10 lg:py-12" aria-label="Partenaires institutionnels">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 rounded-2xl bg-[#002f1d] p-5 shadow-[0_14px_34px_rgba(0,47,29,0.14)] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-7 lg:rounded-3xl lg:px-10 lg:py-8">
            <h2 className="text-xl font-black uppercase leading-tight text-white sm:text-2xl lg:text-3xl">
              Devenez partenaire du club
            </h2>
            <Link
              href="/le-club/valeurs-partenaires#devenir-partenaire"
              className="focus-ring inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-xl bg-[#f7c600] px-6 text-sm font-black uppercase text-[#002f1d] transition hover:bg-[#ffd62e] sm:min-w-56 sm:text-base lg:min-h-14 lg:min-w-72 lg:text-lg"
            >
              Nous rejoindre <ArrowRight size={22} aria-hidden="true" />
            </Link>
          </div>

          <div className="institutional-partners-marquee mt-4 overflow-hidden sm:mt-5 lg:hidden">
            <div className="institutional-partners-marquee__track flex w-max">
              {[false, true].map((isDuplicate) => (
                <div key={String(isDuplicate)} className="flex shrink-0 gap-3 pr-3 sm:gap-5 sm:pr-5" aria-hidden={isDuplicate || undefined}>
                  {institutionalPartners.map((partner) => (
                    <InstitutionalPartnerCard
                      key={partner.name}
                      partner={partner}
                      interactive={!isDuplicate}
                      className="focus-ring flex min-h-36 w-[72vw] max-w-[25rem] shrink-0 flex-col items-center justify-center rounded-2xl border border-[#002f1d]/15 bg-white p-4 shadow-[0_8px_22px_rgba(0,47,29,0.08)] sm:min-h-48 sm:w-[44vw] sm:p-6"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 hidden grid-cols-2 gap-5 lg:grid">
            {institutionalPartners.map((partner) => (
              <InstitutionalPartnerCard
                key={partner.name}
                partner={partner}
                className="focus-ring flex min-h-56 flex-col items-center justify-center rounded-2xl border border-[#002f1d]/15 bg-white p-6 shadow-[0_8px_22px_rgba(0,47,29,0.08)]"
              />
            ))}
          </div>
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
