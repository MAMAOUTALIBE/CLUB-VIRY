import { ButtonLink } from "@/components/ButtonLink";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { StaffDirectory } from "@/components/club/ClubPublicBlocks";
import { getClubOfficials, officialToStaffPerson } from "@/lib/public-content";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/dirigeants");
export const revalidate = 300;

export default async function DirigeantsPage() {
  const { dirigeants } = await getClubOfficials();
  const people = dirigeants.map((official) => officialToStaffPerson(official, images.supporters));

  return (
    <>
      <MobileScreen
        eyebrow="Le Club"
        title="Dirigeants"
        actions={[{ href: "/le-club/organigramme", label: "Organigramme" }]}
        scrollable
      >
        <div className="grid gap-3 pb-2">
          {people.map((person) => (
            <MobileCard key={person.name}>
              <p className="text-xs font-black uppercase text-[#664d00]">{person.pole}</p>
              <h2 className="mt-1 text-lg font-black uppercase text-[#002f1d]">{person.name}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-700">{person.role}</p>
            </MobileCard>
          ))}
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero
        eyebrow="Le Club"
        description="Les dirigeants accompagnent le fonctionnement quotidien du club : administratif, licences, communication, partenariats, bénévoles, arbitrage et sécurité."
        image={images.supporters}
        title="Les dirigeants"
      >
        <ButtonLink href="/le-club/organigramme">Voir l'organigramme</ButtonLink>
      </PageHero>

      <StaffDirectory
        intro="Les responsables de pôle et référents du club. Cette présentation publique évite les contacts personnels directs : familles et partenaires passent par les canaux officiels du club."
        people={people}
      />

      <section className="bg-[#f7f8f4] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Fonctionnement" title="Des rôles visibles pour orienter les demandes" text="Chaque pôle doit pouvoir aider les familles, les éducateurs et les bénévoles à trouver le bon interlocuteur." />
        </div>
      </section>
      </DesktopOnly>
    </>
  );
}
