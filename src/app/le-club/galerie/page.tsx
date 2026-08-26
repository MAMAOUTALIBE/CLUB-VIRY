import { PageHero } from "@/components/PageHero";
import { PremiumCta } from "@/components/PremiumCta";
import { SectionTitle } from "@/components/SectionTitle";
import { DesktopOnly, MobileScreen } from "@/components/MobilePage";
import { MediaGallery } from "@/components/MediaGallery";
import { images } from "@/lib/images";
import { getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/galerie");
export const dynamic = "force-dynamic"; // CMS : archives à jour immédiatement

export default async function GaleriePage() {
  const { galerieArchives } = await getSiteSettings();
  return (
    <>
      <MobileScreen
        eyebrow="Le Club"
        title="Archives"
        actions={[{ href: "/le-club/histoire", label: "Histoire", variant: "secondary" }]}
        scrollable
      >
        <div className="pb-2">
          <MediaGallery compact items={galerieArchives} />
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero
        eyebrow="Le Club"
        description="Plus de soixante clichés d'archives, des équipes de jeunes des années 1960 à l'épopée en Coupe de France : la mémoire en images de l'ES Viry-Châtillon."
        image={images.teamHuddle}
        title="Galerie photos historiques"
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Archives"
          title="Photos historiques du club"
          text="De l'école de foot aux seniors, des tournois de jeunes aux grandes affiches : cliquez sur une photo pour l'agrandir."
        />
        <div className="mt-10">
          <MediaGallery items={galerieArchives} />
        </div>
      </section>
      <PremiumCta
        primaryHref="/le-club/histoire"
        primaryLabel="Découvrir l'histoire"
        secondaryHref="/le-club"
        secondaryLabel="Retour au club"
        text="Une mémoire vivante, transmise de génération en génération depuis 1958."
        title="L'histoire du club en images"
      />
      </DesktopOnly>
    </>
  );
}
