import { ButtonLink } from "@/components/ButtonLink";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { StaffDirectory } from "@/components/club/ClubPublicBlocks";
import { getClubOfficials, officialToStaffPerson } from "@/lib/public-content";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/bureau");
export const revalidate = 300;

export default async function BureauPage() {
  const { bureau } = await getClubOfficials();
  const people = bureau.map((official) => officialToStaffPerson(official, images.stadiumAerial));

  return (
    <>
      <MobileScreen
        eyebrow="Le Club"
        title="Bureau"
        actions={[{ href: "/le-club/organigramme", label: "Organigramme" }]}
        scrollable
      >
        <div className="grid gap-3 pb-2">
          {people.map((person) => (
            <MobileCard key={person.name}>
              <p className="text-xs font-black uppercase text-[#664d00]">{person.category}</p>
              <h2 className="mt-1 text-lg font-black uppercase text-[#002f1d]">{person.name}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-700">{person.role}</p>
            </MobileCard>
          ))}
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero
        eyebrow="Le Club"
        description="Le bureau porte la direction associative : gouvernance, finances, secrétariat, stratégie et suivi des décisions importantes."
        image={images.stadiumAerial}
        title="Le bureau"
      >
        <ButtonLink href="/le-club/organigramme">Comprendre l'organisation</ButtonLink>
      </PageHero>

      <StaffDirectory
        intro="Le bureau exécutif de l'ES Viry-Châtillon Football : présidence, gouvernance, finances et secrétariat général."
        people={people}
      />

      <section className="club-shell px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle inverse eyebrow="Mission" title="Piloter le club avec clarté" text="Le bureau assure la cohérence entre projet sportif, vie associative, obligations administratives et accueil des familles." />
        </div>
      </section>
      </DesktopOnly>
    </>
  );
}
