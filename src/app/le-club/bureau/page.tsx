import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { StaffDirectory } from "@/components/club/ClubPublicBlocks";
import { bureau } from "@/lib/club-pages-data";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/bureau");

export default function BureauPage() {
  return (
    <>
      <PageHero
        eyebrow="Le Club"
        description="Le bureau porte la direction associative : gouvernance, finances, secrétariat, stratégie et suivi des décisions importantes."
        image={images.stadiumAerial}
        title="Le bureau"
      >
        <ButtonLink href="/le-club/organigramme">Comprendre l'organisation</ButtonLink>
      </PageHero>

      <StaffDirectory
        intro="Les noms affichés sont des données de démonstration. La structure permet d'intégrer ensuite les membres officiels et leurs périmètres."
        people={bureau}
      />

      <section className="club-shell px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle inverse eyebrow="Mission" title="Piloter le club avec clarté" text="Le bureau assure la cohérence entre projet sportif, vie associative, obligations administratives et accueil des familles." />
        </div>
      </section>
    </>
  );
}
