import { PageHero } from "@/components/PageHero";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { images } from "@/lib/images";
import { getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/politique-confidentialite");
export const dynamic = "force-dynamic"; // CMS : politique de confidentialité à jour immédiatement

export default async function PrivacyPage() {
  const { politiqueConfidentialite } = await getSiteSettings();
  return (
    <>
      <MobileScreen eyebrow="Données personnelles" title="Confidentialité">
        <MobileCard>
          <p className="text-sm font-semibold leading-6 text-slate-700">{politiqueConfidentialite.mobileSummary}</p>
        </MobileCard>
      </MobileScreen>
      <DesktopOnly>
        <PageHero description="Protection des données des licenciés, familles et visiteurs." image={images.training} title="Politique de confidentialité" />
        <section className="mx-auto max-w-4xl px-4 pb-10 leading-8 text-slate-700 md:py-14 sm:px-6 lg:px-8">
          {politiqueConfidentialite.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>
      </DesktopOnly>
    </>
  );
}
