import { PageHero } from "@/components/PageHero";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/boutique/conditions-generales");

export default function TermsPage() {
  return (
    <>
      <PageHero description="Informations boutique à finaliser lors de l'ouverture officielle." image={images.football} title="Conditions générales" />
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="leading-8 text-slate-700">
          Les conditions générales de vente seront publiées avant l'ouverture officielle de la boutique en ligne.
        </p>
      </section>
    </>
  );
}
