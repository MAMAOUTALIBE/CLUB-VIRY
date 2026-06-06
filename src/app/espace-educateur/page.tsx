import { AuthMockForm } from "@/components/Forms";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { images } from "@/lib/images";

export const metadata = {
  title: "Espace éducateur"
};

export default function EducatorSpacePage() {
  return (
    <>
      <PageHero description="Gérez vos groupes, séances, convocations et feuilles de match." image={images.pitch} title="Espace éducateur" />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <SectionTitle title="Outils éducateurs" text="Un espace pensé pour faciliter le suivi des groupes, séances et convocations." />
          <div className="grid gap-4">
            {["Mes équipes", "Mes séances", "Convocations", "Présences", "Compte rendu de match"].map((item) => (
              <div className="official-card rounded-lg bg-white p-5 font-black uppercase text-[#002f1d]" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
        <AuthMockForm role="éducateur" />
      </section>
    </>
  );
}
