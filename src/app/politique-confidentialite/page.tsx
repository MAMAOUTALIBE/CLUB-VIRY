import { PageHero } from "@/components/PageHero";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/politique-confidentialite");

export default function PrivacyPage() {
  return (
    <>
      <MobileScreen eyebrow="Données personnelles" title="Confidentialité">
        <MobileCard>
          <p className="text-sm font-semibold leading-6 text-slate-700">Les formulaires servent uniquement au traitement des demandes du club.</p>
        </MobileCard>
      </MobileScreen>
      <DesktopOnly>
        <PageHero description="Protection des données des licenciés, familles et visiteurs." image={images.training} title="Politique de confidentialité" />
        <section className="mx-auto max-w-4xl px-4 pb-10 leading-8 text-slate-700 md:py-14 sm:px-6 lg:px-8">
          <p>Les données collectées via les formulaires servent uniquement au traitement des demandes du club. Les règles de conservation, d'accès et de suppression seront précisées par le club.</p>
        </section>
      </DesktopOnly>
    </>
  );
}
