import { PageHero } from "@/components/PageHero";
import { DesktopOnly } from "@/components/MobilePage";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/politique-confidentialite");

export default function PrivacyPage() {
  return (
    <>
      <div className="px-4 py-8 md:px-6 lg:px-8 xl:hidden">
        <p className="text-xs font-black uppercase text-[#664d00]">Données personnelles</p>
        <h1 className="mt-1 text-3xl font-black uppercase leading-tight text-[#002f1d]">Confidentialité</h1>
      </div>
      <DesktopOnly>
        <PageHero description="Protection des données des licenciés, familles et visiteurs." image={images.training} title="Politique de confidentialité" />
      </DesktopOnly>
      <section className="mx-auto max-w-4xl px-4 pb-10 leading-8 text-slate-700 md:py-14 sm:px-6 lg:px-8">
        <p>Les données collectées via les formulaires servent uniquement au traitement des demandes du club. Les règles de conservation, d'accès et de suppression seront précisées par le club.</p>
      </section>
    </>
  );
}
