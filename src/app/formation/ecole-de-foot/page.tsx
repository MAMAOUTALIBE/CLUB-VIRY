import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { StaffDirectory, TrainingSlots } from "@/components/club/ClubPublicBlocks";
import { ecoleFootEducators, trainingSlots } from "@/lib/club-pages-data";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/formation/ecole-de-foot");

export default function EcoleDeFootPage() {
  return (
    <>
      <PageHero
        eyebrow="Formation"
        description="Découvrez l'organisation de l'école de foot, les éducateurs référents et les repères de progression des catégories U6 à U13."
        image={images.training}
        title="Éducateurs de l'école de foot"
      >
        <ButtonLink href="/inscriptions">Rejoindre l'école de foot</ButtonLink>
      </PageHero>

      <StaffDirectory
        intro="Les contacts affichés sont volontairement centralisés via le secrétariat : aucune coordonnée personnelle n'est publiée sur le site."
        people={ecoleFootEducators}
      />

      <section className="bg-[#f7f8f4] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Repères familles" title="Créneaux et lieux indicatifs" text="Ces informations servent de base publique. Les convocations et changements de dernière minute restent gérés dans le CRM." />
          <TrainingSlots slots={trainingSlots} />
        </div>
      </section>
    </>
  );
}
