import { PageHero } from "@/components/PageHero";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { images } from "@/lib/images";
import { getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/boutique/conditions-generales");
export const dynamic = "force-dynamic"; // CMS : CGV à jour immédiatement

export default async function TermsPage() {
  const { boutiqueCgv } = await getSiteSettings();
  return (
    <>
      <MobileScreen eyebrow="Boutique" title="Conditions" actions={[{ href: "/boutique", label: "Boutique", variant: "secondary" }]}>
        <MobileCard>
          <p className="text-sm font-semibold leading-6 text-slate-700">{boutiqueCgv.mobileSummary}</p>
        </MobileCard>
      </MobileScreen>
      <DesktopOnly>
      <PageHero description="Informations boutique à finaliser lors de l'ouverture officielle." image={images.football} title="Conditions générales" />
      <section className="mx-auto max-w-4xl px-4 py-14 leading-8 text-slate-700 sm:px-6 lg:px-8">
        {boutiqueCgv.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </section>
      </DesktopOnly>
    </>
  );
}
