import { ButtonLink } from "@/components/ButtonLink";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { InstallationCards } from "@/components/club/ClubPublicBlocks";
import { images } from "@/lib/images";
import { getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/installations");
export const dynamic = "force-dynamic"; // CMS : installations à jour immédiatement

export default async function InstallationsPage() {
  const { installations } = await getSiteSettings();
  return (
    <>
      <MobileScreen
        eyebrow="Le Club"
        title="Installations"
        actions={[{ href: "/le-club/stade-henri-longuet", label: "Stade" }]}
        scrollable
      >
        <div className="grid gap-3 pb-2">
          {installations.map((installation) => (
            <MobileCard key={installation.name}>
              <p className="text-xs font-black uppercase text-[#664d00]">{installation.type}</p>
              <h2 className="mt-1 text-lg font-black uppercase text-[#002f1d]">{installation.name}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-700">{installation.address}</p>
            </MobileCard>
          ))}
        </div>
      </MobileScreen>
      <DesktopOnly>
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
      </DesktopOnly>
    </>
  );
}
