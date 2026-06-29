import { Camera, Clapperboard, Image as ImageIcon } from "lucide-react";
import { FeatureCards } from "@/components/FeatureCards";
import { MediaGallery } from "@/components/MediaGallery";
import { DesktopOnly, MobileScreen } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { images } from "@/lib/images";
import { getPublicAlbums } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/medias");
export const revalidate = 300; // ISR : contenu CMS rafraichi toutes les 5 min

export default async function MediaPage() {
  const albums = await getPublicAlbums();
  return (
    <>
      <MobileScreen
        eyebrow="Médias"
        title="Galerie"
        description="Les derniers moments du club en images."
        scrollable
      >
        <div className="grid grid-cols-2 gap-3 pb-2 lg:grid-cols-3">
          {albums.map((album) => (
            <article className="overflow-hidden rounded-lg border border-[#07542f]/12 bg-white shadow-sm" key={album.title}>
              <div className="aspect-square overflow-hidden bg-[#002f1d]">
                <img src={album.image} alt={album.title} className="h-full w-full object-cover" />
              </div>
              <h2 className="p-3 text-sm font-black uppercase leading-tight text-[#002f1d]">{album.title}</h2>
            </article>
          ))}
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero description="Photos, vidéos et interviews du club." image={images.supporters} title="Médias / Galerie" />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Pas de barre de filtres : la galerie n'a pas de filtrage reel (false affordance retiree). */}
        <div className="mb-8">
          <SectionTitle title="Photos récentes" text="La vie du club en images : joie, effort, supporters, matchs et moments de transmission. Cliquez sur une photo pour l'agrandir." />
        </div>
        <MediaGallery items={albums} />
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <FeatureCards
          items={[
            { title: "Photos", text: "Valoriser les équipes et les moments forts.", icon: Camera },
            { title: "Vidéos", text: "Créer une expérience plus vivante autour du club.", icon: Clapperboard },
            { title: "Albums", text: "Classer les temps forts par catégorie et événement.", icon: ImageIcon }
          ]}
        />
      </section>
      </DesktopOnly>
    </>
  );
}
