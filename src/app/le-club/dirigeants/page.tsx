import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { StaffDirectory } from "@/components/club/ClubPublicBlocks";
import { dirigeants } from "@/lib/club-pages-data";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/dirigeants");

export default function DirigeantsPage() {
  return (
    <>
      <PageHero
        eyebrow="Le Club"
        description="Les dirigeants accompagnent le fonctionnement quotidien du club : administratif, logistique, communication, sportif et partenariats."
        image={images.supporters}
        title="Les dirigeants"
      >
        <ButtonLink href="/le-club/organigramme">Voir l'organigramme</ButtonLink>
      </PageHero>

      <StaffDirectory
        intro="Cette présentation publique évite les contacts personnels directs. Les familles et partenaires passent par les canaux officiels du club."
        people={dirigeants}
      />

      <section className="bg-[#f7f8f4] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Fonctionnement" title="Des rôles visibles pour orienter les demandes" text="Chaque pôle doit pouvoir aider les familles, les éducateurs et les bénévoles à trouver le bon interlocuteur." />
        </div>
      </section>
    </>
  );
}
