import { ClipboardList, GraduationCap, Landmark, Settings } from "lucide-react";
import { FeatureCards } from "@/components/FeatureCards";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { images } from "@/lib/images";
import { getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/organigramme");
export const dynamic = "force-dynamic";

export default async function OrganizationPage() {
  const { organigramme } = await getSiteSettings();
  return (
    <>
      <PageHero description="Une organisation claire pour accompagner les licenciés, les familles et les éducateurs." image={images.training} title="Organigramme" />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle title={organigramme.title} text={organigramme.intro} />
        <div className="grid gap-4 md:grid-cols-2">
          {organigramme.groups.map((group) => (
            <article className="official-card rounded-lg bg-white p-6" key={group.title}>
              <h2 className="text-2xl font-black uppercase text-[#002f1d]">{group.title}</h2>
              <p className="mt-3 text-slate-700">{group.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="club-shell px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle inverse eyebrow="Fonctionnement" title="Une organisation au service du terrain" text="Chaque pôle doit soutenir la progression des joueurs et la qualité d'accueil des familles." />
          <FeatureCards
            inverse
            items={[
              { title: "Décision", text: "Un bureau qui fixe le cap et garantit la cohérence du projet.", icon: Landmark },
              { title: "Sportif", text: "Une direction technique qui structure les catégories.", icon: GraduationCap },
              { title: "Administratif", text: "Des procédures claires pour les licences, documents et inscriptions.", icon: ClipboardList },
              { title: "Opérationnel", text: "Des rôles lisibles pour fluidifier la vie du club.", icon: Settings }
            ]}
          />
        </div>
      </section>
    </>
  );
}
