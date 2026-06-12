import { Camera, Clapperboard, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { FeatureCards } from "@/components/FeatureCards";
import { Stagger, StaggerItem } from "@/components/Motion";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { images } from "@/lib/images";
import { getPublicAlbums } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/medias");
export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const albums = await getPublicAlbums();
  return (
    <>
      <PageHero description="Photos, vidéos et interviews du club." image={images.supporters} title="Médias / Galerie" />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Pas de barre de filtres : la galerie n'a pas de filtrage reel (false affordance retiree). */}
        <div className="mb-8">
          <SectionTitle title="Photos récentes" text="La vie du club en images : joie, effort, supporters, matchs et moments de transmission." />
        </div>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {albums.map((item, index) => (
            <StaggerItem className={`premium-card overflow-hidden rounded-lg bg-white ${index === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`} key={item.title}>
              <div className={`relative w-full ${index === 0 ? "h-[29rem]" : "h-52"}`}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes={index === 0 ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
                  className="object-cover"
                />
              </div>
              <figcaption className="p-3 text-sm font-black uppercase text-[#002f1d]">{item.title}</figcaption>
            </StaggerItem>
          ))}
        </Stagger>
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
    </>
  );
}
