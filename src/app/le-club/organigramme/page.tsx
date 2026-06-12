import { ClipboardList, GraduationCap, Landmark, Settings } from "lucide-react";
import { FeatureCards } from "@/components/FeatureCards";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/organigramme");

const groups = [
  ["Bureau", "Président, vice-présidents, trésorerie, secrétariat général"],
  ["Direction sportive", "Responsable technique, coordinateurs catégories, référents gardiens"],
  ["Éducateurs", "École de foot, jeunes, seniors, féminines, futsal"],
  ["Administration", "Licences, inscriptions, communication, partenariats"]
];

export default function OrganizationPage() {
  return (
    <>
      <PageHero description="Une organisation claire pour accompagner les licenciés, les familles et les éducateurs." image={images.training} title="Organigramme" />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle title="Structure du club" text="Une organisation claire permet au club d'être lisible pour les familles, les éducateurs et les partenaires." />
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map(([title, text]) => (
            <article className="official-card rounded-lg bg-white p-6" key={title}>
              <h2 className="text-2xl font-black uppercase text-[#002f1d]">{title}</h2>
              <p className="mt-3 text-slate-700">{text}</p>
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
