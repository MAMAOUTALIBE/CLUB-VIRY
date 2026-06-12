import { PageHero } from "@/components/PageHero";
import { EducatorSpace } from "@/components/educator/EducatorSpace";
import { images } from "@/lib/images";

export const metadata = {
  title: "Espace éducateur"
};

export default function EducatorSpacePage() {
  return (
    <>
      <PageHero description="Gérez vos équipes, votre effectif et vos matchs." image={images.pitch} title="Espace éducateur" />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <EducatorSpace />
      </section>
    </>
  );
}
