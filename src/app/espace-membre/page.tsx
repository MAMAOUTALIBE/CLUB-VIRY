import { MemberSpace } from "@/components/member/MemberSpace";
import { PageHero } from "@/components/PageHero";
import { images } from "@/lib/images";

export const metadata = {
  title: "Espace membre"
};

export default function MemberSpacePage() {
  return (
    <>
      <PageHero description="Vos notifications, vos licenciés et vos préférences de communication avec le club." image={images.training} title="Espace membre" />
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <MemberSpace />
      </section>
    </>
  );
}
