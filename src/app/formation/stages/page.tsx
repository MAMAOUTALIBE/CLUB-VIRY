import { ButtonLink } from "@/components/ButtonLink";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { StageCards } from "@/components/club/ClubPublicBlocks";
import { stages } from "@/lib/club-pages-data";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/formation/stages");

export default function StagesPage() {
  return (
    <>
      <MobileScreen
        eyebrow="Formation"
        title="Stages"
        actions={[{ href: "/contact", label: "Infos" }]}
        scrollable
      >
        <div className="grid gap-3 pb-2">
          {stages.map((stage) => (
            <MobileCard key={stage.title}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase text-[#664d00]">{stage.audience}</p>
                  <h2 className="mt-1 text-lg font-black uppercase text-[#002f1d]">{stage.title}</h2>
                </div>
                <span className="shrink-0 rounded-md bg-[#07542f]/10 px-2 py-1 text-[11px] font-black uppercase text-[#07542f]">{stage.status}</span>
              </div>
              <p className="mt-2 text-sm font-bold text-slate-700">{stage.dates}</p>
            </MobileCard>
          ))}
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero
        eyebrow="Formation"
        description="Stages vacances, perfectionnement, gardiens ou découverte : une page claire pour suivre les prochaines actions du club."
        image={images.pitch}
        title="Stages"
      >
        <ButtonLink href="/contact">Demander une information</ButtonLink>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Programme" title="Stages proposés" text="Les inscriptions détaillées pourront être connectées ensuite au CRM. Pour l'instant, la page présente les offres et renvoie vers le club." />
        <StageCards stages={stages} />
      </section>
      </DesktopOnly>
    </>
  );
}
