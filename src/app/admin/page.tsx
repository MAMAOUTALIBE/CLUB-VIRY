import { ShieldCheck } from "lucide-react";
import { AuthMockForm } from "@/components/Forms";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { adminModules } from "@/lib/data";
import { images } from "@/lib/images";

export const metadata = {
  title: "Administration"
};

export default function AdminPage() {
  return (
    <>
      <PageHero description="Interface de gestion prévue pour les administrateurs du club." image={images.stadiumAerial} title="Espace administrateur" />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div>
          <SectionTitle title="Modules de gestion" text="Un espace clair pour piloter les contenus, les équipes et les informations officielles du club." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {adminModules.map((module) => (
              <article className="official-card rounded-lg bg-white p-5" key={module}>
                <ShieldCheck className="text-[#f7c600]" size={28} aria-hidden="true" />
                <h2 className="mt-3 font-black uppercase text-[#002f1d]">{module}</h2>
                <p className="mt-2 text-sm text-slate-600">Créer, modifier, publier, archiver.</p>
              </article>
            ))}
          </div>
        </div>
        <AuthMockForm role="administrateur" />
      </section>
    </>
  );
}
