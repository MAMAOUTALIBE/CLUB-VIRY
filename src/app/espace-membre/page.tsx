import { AuthMockForm } from "@/components/Forms";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { images } from "@/lib/images";

export const metadata = {
  title: "Espace membre"
};

export default function MemberSpacePage() {
  return (
    <>
      <PageHero description="Accédez à vos inscriptions, documents, convocations et informations personnelles." image={images.training} title="Espace membre" />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <SectionTitle title="Services membres" text="Une zone claire pour retrouver les informations importantes liées à la vie du club." />
          <div className="grid gap-4">
            {["Mes licences", "Mes documents", "Mes convocations", "Mes commandes"].map((item) => (
              <div className="official-card rounded-lg bg-white p-5 font-black uppercase text-[#002f1d]" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
        <AuthMockForm role="membre" />
      </section>
    </>
  );
}
