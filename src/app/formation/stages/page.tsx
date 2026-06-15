import { ButtonLink } from "@/components/ButtonLink";
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
    </>
  );
}
