import { Camera, Clapperboard, Image as ImageIcon } from "lucide-react";
import { FeatureCards } from "@/components/FeatureCards";
import { Stagger, StaggerItem } from "@/components/Motion";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { news } from "@/lib/data";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/medias");

export default function MediaPage() {
  return (
    <>
      <PageHero description="Photos, vidéos et interviews du club." image={images.supporters} title="Médias / Galerie" />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle title="Photos récentes" text="La vie du club en images : joie, effort, supporters, matchs et moments de transmission." />
          <div className="mb-8 flex flex-wrap gap-2">
            {["Photos", "Vidéos", "Interviews", "Matchs"].map((item) => (
              <span className="rounded-full border border-[#002f1d]/15 bg-white px-3 py-2 text-xs font-black uppercase text-[#002f1d]" key={item}>{item}</span>
            ))}
          </div>
        </div>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {news.map((item, index) => (
            <StaggerItem className={`premium-card overflow-hidden rounded-lg bg-white ${index === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`} key={item.title}>
              <img decoding="async" loading="lazy" alt={item.title} className={`${index === 0 ? "h-[29rem]" : "h-52"} w-full object-cover`} src={item.image} />
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
