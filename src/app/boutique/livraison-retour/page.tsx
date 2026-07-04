import { PageHero } from "@/components/PageHero";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/boutique/livraison-retour");

export default function DeliveryPage() {
  return (
    <>
      <MobileScreen eyebrow="Boutique" title="Livraison & retour" actions={[{ href: "/boutique", label: "Boutique", variant: "secondary" }]}>
        <MobileCard>
          <p className="text-sm font-semibold leading-6 text-slate-700">
            Retrait au club-house ou expédition selon les options ouvertes par le club.
          </p>
        </MobileCard>
      </MobileScreen>
      <DesktopOnly>
      <PageHero description="Modalités de retrait au club, livraison et retours." image={images.football} title="Livraison & retour" />
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="leading-8 text-slate-700">
          Les commandes pourront être retirées au club house ou expédiées selon les options ouvertes par le club. Les retours seront traités par le secrétariat.
        </p>
      </section>
      </DesktopOnly>
    </>
  );
}
