import { MemberSpace } from "@/components/member/MemberSpace";
import { DesktopOnly, MobileScreen } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { images } from "@/lib/images";

export const metadata = {
  title: "Espace membre"
};

export default function MemberSpacePage() {
  return (
    <>
      <MobileScreen eyebrow="Mon espace" title="Espace membre" scrollable>
        <div className="pb-2">
          <MemberSpace />
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero description="Vos notifications, vos licenciés et vos préférences de communication avec le club." image={images.training} title="Espace membre" />
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <MemberSpace />
      </section>
      </DesktopOnly>
    </>
  );
}
