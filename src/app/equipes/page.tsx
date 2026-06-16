import { PremiumCta } from "@/components/PremiumCta";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { TeamsDirectory } from "@/components/TeamsDirectory";
import { images } from "@/lib/images";
import { getPublicTeams } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/equipes");
export const revalidate = 300; // ISR : contenu CMS rafraichi toutes les 5 min

export default async function TeamsPage() {
  const teams = await getPublicTeams();
  return (
    <>
      <PageHero description="De l'école de foot aux Seniors, retrouvez toutes les catégories du club." image={images.teamHuddle} title="Nos équipes" />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle eyebrow="Toutes les équipes" title="De l'école de foot aux Seniors" text="Un parcours sportif lisible, du premier ballon aux équipes seniors." />
        </div>
        <TeamsDirectory teams={teams} />
      </section>
      <PremiumCta
        primaryHref="/inscriptions"
        primaryLabel="Rejoindre une équipe"
        secondaryHref="/detections-recrutement"
        secondaryLabel="Candidater aux détections"
        text="De l'école de foot aux seniors, chaque catégorie accueille joueurs et parents dans une structure sérieuse."
        title="Votre enfant a sa place dans la famille Viry"
      />
    </>
  );
}
