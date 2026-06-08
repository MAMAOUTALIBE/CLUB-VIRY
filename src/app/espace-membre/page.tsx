import Link from "next/link";
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
        <div className="official-card flex flex-col justify-center rounded-lg bg-white p-6 sm:p-8">
          <p className="text-xs font-black uppercase text-[#f7c600]">Bientôt disponible</p>
          <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Votre espace personnel arrive</h2>
          <div className="gold-divider mt-3" aria-hidden="true" />
          <p className="mt-5 text-sm font-semibold text-slate-700">
            La connexion à l'espace membre (licences, documents, convocations et commandes) sera activée très
            prochainement. En attendant, le club reste à votre disposition pour toute demande.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="focus-ring inline-flex min-h-11 items-center rounded-md bg-[#f7c600] px-5 py-3 text-sm font-black uppercase text-[#002f1d] hover:bg-[#002f1d] hover:text-white"
              href="/contact"
            >
              Contacter le club
            </Link>
            <Link
              className="focus-ring inline-flex min-h-11 items-center rounded-md border border-[#002f1d]/20 px-5 py-3 text-sm font-black uppercase text-[#002f1d] hover:bg-[#002f1d] hover:text-white"
              href="/inscriptions"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
