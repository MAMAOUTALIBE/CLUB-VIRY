import { PageHero } from "@/components/PageHero";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { images } from "@/lib/images";
import { getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/mentions-legales");
export const dynamic = "force-dynamic"; // CMS : mentions légales à jour immédiatement

export default async function LegalPage() {
  const { mentionsLegales } = await getSiteSettings();
  return (
    <>
      <MobileScreen eyebrow="Informations légales" title="Mentions légales">
        <MobileCard>
          <p className="text-sm font-semibold leading-6 text-slate-700">{mentionsLegales.mobileSummary}</p>
        </MobileCard>
      </MobileScreen>
      <DesktopOnly>
        <PageHero description="Informations légales du site officiel." image={images.stadiumAerial} title="Mentions légales" />
        <section className="mx-auto max-w-4xl px-4 pb-10 leading-8 text-slate-700 md:py-14 sm:px-6 lg:px-8">
          {mentionsLegales.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>
      </DesktopOnly>
    </>
  );
}
