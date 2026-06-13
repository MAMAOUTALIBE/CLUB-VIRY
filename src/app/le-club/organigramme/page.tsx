import { ClipboardList, GraduationCap, Landmark, Settings } from "lucide-react";
import { FeatureCards } from "@/components/FeatureCards";
import { OfficialCard } from "@/components/club/OfficialCard";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { images } from "@/lib/images";
import { getClubOfficials, getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/organigramme");
export const dynamic = "force-dynamic";

export default async function OrganizationPage() {
  const [{ organigramme }, officials] = await Promise.all([getSiteSettings(), getClubOfficials()]);

  return (
    <>
      <PageHero description="Une organisation claire pour accompagner les licenciés, les familles et les éducateurs." image={images.training} title="Organigramme" />

      {officials.bureau.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Gouvernance" title="Le bureau exécutif" text="Les femmes et les hommes qui fixent le cap du club et garantissent la cohérence du projet." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {officials.bureau.map((official) => (
              <OfficialCard featured key={official.id} official={official} />
            ))}
          </div>
        </section>
      ) : null}

      {officials.dirigeants.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
          <SectionTitle title="Les dirigeants" text="Des bénévoles engagés au quotidien pour faire vivre le club et accompagner les licenciés." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {officials.dirigeants.map((official) => (
              <OfficialCard key={official.id} official={official} />
            ))}
          </div>
        </section>
      ) : null}

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
