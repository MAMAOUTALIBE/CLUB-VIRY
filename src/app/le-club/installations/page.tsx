import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { InstallationCards } from "@/components/club/ClubPublicBlocks";
import { installations } from "@/lib/club-pages-data";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/installations");

export default function InstallationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Le Club"
        description="Terrains, club-house, lieux de rendez-vous et informations pratiques pour rejoindre les activités de l'ES Viry-Châtillon."
        image={images.stadiumAerial}
        title="Installations"
      >
        <ButtonLink href="/le-club/stade-henri-longuet">Voir le stade Henri Longuet</ButtonLink>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Lieux du club" title="Les espaces de pratique et d'accueil" text="Chaque installation est présentée avec son usage principal, les publics concernés et un lien d'itinéraire." />
        <InstallationCards installations={installations} />
      </section>
    </>
  );
}
