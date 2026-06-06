import { PageHero } from "@/components/PageHero";
import { images } from "@/lib/images";

export const metadata = {
  title: "Politique de confidentialité"
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero description="Protection des données des licenciés, familles et visiteurs." image={images.training} title="Politique de confidentialité" />
      <section className="mx-auto max-w-4xl px-4 py-14 leading-8 text-slate-700 sm:px-6 lg:px-8">
        <p>Les données collectées via les formulaires servent uniquement au traitement des demandes du club. Les règles de conservation, d'accès et de suppression seront précisées par le club.</p>
      </section>
    </>
  );
}
