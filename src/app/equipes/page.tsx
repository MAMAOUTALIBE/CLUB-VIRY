import { PremiumCta } from "@/components/PremiumCta";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { TeamsDirectory } from "@/components/TeamsDirectory";
import { DesktopOnly, MobileLinkCard, MobileScreen, MobileScrollableList } from "@/components/MobilePage";
import { images } from "@/lib/images";
import { getPublicTeams } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/equipes");
export const revalidate = 300; // ISR : contenu CMS rafraichi toutes les 5 min

export default async function TeamsPage() {
  const teams = await getPublicTeams();
  return (
    <>
      <MobileScreen
        eyebrow="Équipes"
        title="Nos catégories"
        description="Du premier ballon aux seniors, retrouvez chaque groupe du club."
        actions={[{ href: "/inscriptions", label: "Rejoindre une équipe" }]}
      >
        <MobileScrollableList>
          {teams.map((team) => (
            <MobileLinkCard href={`/equipes/${team.slug}`} key={team.slug}>
              <p className="text-xs font-black uppercase text-[#664d00]">{team.category}</p>
              <h2 className="mt-1 text-lg font-black uppercase text-[#002f1d]">{team.name}</h2>
              <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-700">{team.description}</p>
            </MobileLinkCard>
          ))}
        </MobileScrollableList>
      </MobileScreen>
      <DesktopOnly>
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
      </DesktopOnly>
    </>
  );
}
