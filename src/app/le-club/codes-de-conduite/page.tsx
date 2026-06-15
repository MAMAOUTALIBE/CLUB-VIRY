import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { ConductGrid } from "@/components/club/ClubPublicBlocks";
import { conductBlocks } from "@/lib/club-pages-data";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/codes-de-conduite");

export default function CodesDeConduitePage() {
  return (
    <>
      <PageHero
        eyebrow="Le Club"
        description="Un cadre partagé pour les joueurs, parents, éducateurs, dirigeants et supporters : respect, ponctualité, responsabilité et confiance."
        image={images.teamHuddle}
        title="Codes de conduite"
      >
        <ButtonLink href="/contact">Signaler une question au club</ButtonLink>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Règlement intérieur" title="Les règles qui protègent le collectif" text="Cette version publique pose les principes. Le PDF officiel pourra être ajouté dès validation du document final." />
        <ConductGrid blocks={conductBlocks} />
      </section>
    </>
  );
}
