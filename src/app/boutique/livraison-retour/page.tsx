import { PageHero } from "@/components/PageHero";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { images } from "@/lib/images";
import { getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/boutique/livraison-retour");
export const dynamic = "force-dynamic"; // CMS : livraison & retour à jour immédiatement

export default async function DeliveryPage() {
  const { boutiqueLivraison } = await getSiteSettings();
  return (
    <>
      <MobileScreen eyebrow="Boutique" title="Livraison & retour" actions={[{ href: "/boutique", label: "Boutique", variant: "secondary" }]}>
        <MobileCard>
          <p className="text-sm font-semibold leading-6 text-slate-700">{boutiqueLivraison.mobileSummary}</p>
        </MobileCard>
      </MobileScreen>
      <DesktopOnly>
      <PageHero description="Modalités de retrait au club, livraison et retours." image={images.football} title="Livraison & retour" />
      <section className="mx-auto max-w-4xl px-4 py-14 leading-8 text-slate-700 sm:px-6 lg:px-8">
        {boutiqueLivraison.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </section>
      </DesktopOnly>
    </>
  );
}
