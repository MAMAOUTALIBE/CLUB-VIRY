import { MemberSpace } from "@/components/member/MemberSpace";
import { DesktopOnly, MobileScreen } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { images } from "@/lib/images";

export const metadata = {
  title: "Espace famille",
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

export default function MemberSpacePage() {
  return (
    <>
      <MobileScreen eyebrow="Mon espace" title="Espace famille" scrollable>
        <div className="pb-2">
          <MemberSpace />
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero description="Les ressources, convocations et informations attribuées à votre famille." image={images.training} title="Espace famille" />
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <MemberSpace />
      </section>
      </DesktopOnly>
    </>
  );
}
