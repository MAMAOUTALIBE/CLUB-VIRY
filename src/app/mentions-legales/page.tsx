import { PageHero } from "@/components/PageHero";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/mentions-legales");

export default function LegalPage() {
  return (
    <>
      <PageHero description="Informations légales du site officiel." image={images.stadiumAerial} title="Mentions légales" />
      <section className="mx-auto max-w-4xl px-4 py-14 leading-8 text-slate-700 sm:px-6 lg:px-8">
        <p>Éditeur : ES Viry-Châtillon Football.</p>
        <p>Adresse : Stade Henri Longuet, Avenue de l'Armée Leclerc, 91170 Viry-Châtillon.</p>
        <p>Contact : esvirychatillon91170@gmail.com.</p>
      </section>
    </>
  );
}
