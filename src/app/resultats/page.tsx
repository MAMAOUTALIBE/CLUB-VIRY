import { Medal, Trophy } from "lucide-react";

import { DesktopOnly, MobileCard, MobileScreen, MobileScrollableList } from "@/components/MobilePage";
import { PremiumCta } from "@/components/PremiumCta";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { images } from "@/lib/images";
import { getResultsPageData } from "@/lib/results-view";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata = pageMetadata("/resultats");

export default async function ResultsPage() {
  const results = await getResultsPageData();

  return (
    <>
      <MobileScreen
        eyebrow="Scores"
        title="Résultats"
        description="Les derniers scores publiés par le club, équipe par équipe."
        actions={[{ href: "/calendrier", label: "Calendrier", variant: "secondary" }]}
      >
        <MobileScrollableList>
          {results.items.map((item) => (
            <MobileCard key={item.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase text-[#664d00]">{item.competition}</p>
                <p className="text-xs font-bold text-slate-600">{item.dateLabel}</p>
              </div>
              <div className="mt-3 grid gap-2">
                <p className="flex items-center justify-between gap-3 rounded-md bg-slate-100 px-3 py-2 text-sm font-black uppercase text-[#002f1d]">
                  <span className="truncate">{item.home}</span>
                  <span>{item.homeScore}</span>
                </p>
                <p className="flex items-center justify-between gap-3 rounded-md bg-slate-100 px-3 py-2 text-sm font-black uppercase text-[#002f1d]">
                  <span className="truncate">{item.away}</span>
                  <span>{item.awayScore}</span>
                </p>
              </div>
            </MobileCard>
          ))}
        </MobileScrollableList>
      </MobileScreen>
      <DesktopOnly>
      <PageHero description="Derniers scores publiés par le club, équipe par équipe." image={images.teamHuddle} title="Résultats">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#f7c600]/40 bg-black/30 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#f7c600] backdrop-blur">
          <Trophy size={15} aria-hidden="true" />
          Saison 2025 / 2026
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle eyebrow="Scores" title="Derniers résultats" text="Suivez les performances des équipes de l'ES Viry-Châtillon." />
          {results.isFallback ? (
            <p className="mb-8 max-w-md rounded-lg border border-[#f7c600]/30 bg-[#fff8d9] px-4 py-3 text-sm font-bold text-[#5f4a00]">
              Les résultats officiels seront affichés dès leur publication dans le CRM.
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
          {results.items.map((item) => {
            const homeWins = item.homeScore > item.awayScore;
            const awayWins = item.awayScore > item.homeScore;
            return (
              <article className="official-card rounded-lg bg-white p-5" key={item.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black uppercase text-[#664d00]">{item.competition}</p>
                  <Medal className="text-[#f7c600]" size={20} aria-hidden="true" />
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-600">{item.dateLabel}</p>

                <div className="mt-5 grid gap-3">
                  <div className={`flex items-center justify-between gap-4 rounded-lg px-4 py-3 ${homeWins ? "bg-[#f7c600]/25" : "bg-slate-100"}`}>
                    <span className="min-w-0 truncate text-sm font-black uppercase text-[#002f1d]">{item.home}</span>
                    <span className="text-2xl font-black text-[#002f1d]">{item.homeScore}</span>
                  </div>
                  <div className={`flex items-center justify-between gap-4 rounded-lg px-4 py-3 ${awayWins ? "bg-[#f7c600]/25" : "bg-slate-100"}`}>
                    <span className="min-w-0 truncate text-sm font-black uppercase text-[#002f1d]">{item.away}</span>
                    <span className="text-2xl font-black text-[#002f1d]">{item.awayScore}</span>
                  </div>
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-600">{item.place}</p>
              </article>
            );
          })}
        </div>
      </section>

      <PremiumCta
        primaryHref="/calendrier"
        primaryLabel="Voir le calendrier"
        secondaryHref="/equipes"
        secondaryLabel="Toutes les équipes"
        text="Retrouvez les prochains rendez-vous et les fiches équipes du club."
        title="Les résultats et le calendrier avancent ensemble"
      />
      </DesktopOnly>
    </>
  );
}
