import { PageHero } from "@/components/PageHero";
import { DesktopOnly } from "@/components/MobilePage";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/mentions-legales");

export default function LegalPage() {
  return (
    <>
      <div className="px-4 py-8 md:px-6 lg:px-8 xl:hidden">
        <p className="text-xs font-black uppercase text-[#664d00]">Informations légales</p>
        <h1 className="mt-1 text-3xl font-black uppercase leading-tight text-[#002f1d]">Mentions légales</h1>
      </div>
      <DesktopOnly>
        <PageHero description="Informations légales du site officiel." image={images.stadiumAerial} title="Mentions légales" />
      </DesktopOnly>
      <section className="mx-auto max-w-4xl px-4 pb-10 leading-8 text-slate-700 md:py-14 sm:px-6 lg:px-8">
        <p>Éditeur : ES Viry-Châtillon Football.</p>
        <p>Adresse : Stade Henri Longuet, Avenue de l'Armée Leclerc, 91170 Viry-Châtillon.</p>
        <p>Contact : esvirychatillon91170@gmail.com.</p>
      </section>
    </>
  );
}
