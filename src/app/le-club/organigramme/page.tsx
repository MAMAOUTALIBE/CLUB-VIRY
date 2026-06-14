import { ClipboardList, GraduationCap, Landmark, Settings } from "lucide-react";
import { FeatureCards } from "@/components/FeatureCards";
import { OfficialCard } from "@/components/club/OfficialCard";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { images } from "@/lib/images";
import type { DisplayOfficial } from "@/lib/public-content";
import { getClubOfficials, getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/organigramme");
export const revalidate = 300; // ISR : contenu CMS rafraichi toutes les 5 min

function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const value = (parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "");
  return value.toUpperCase() || "?";
}

// Carte Président « en majesté » : plus grande, halo or, badge.
function PresidentCard({ person }: { person: DisplayOfficial }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-[#f7c600]/15 blur-2xl" aria-hidden="true" />
      <article className="relative flex w-72 flex-col items-center rounded-3xl bg-white p-7 text-center text-[#002f1d] shadow-[0_0_60px_-12px_rgba(247,198,0,0.55)] ring-4 ring-[#f7c600]/70">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-b from-[#ffd84d] to-[#f7c600] px-4 py-1 text-[11px] font-black uppercase tracking-wide text-[#001c10] shadow-[0_8px_18px_-8px_rgba(247,198,0,0.7)]">
          Président
        </span>
        {person.photo ? (
          <img src={person.photo} alt={person.name} className="mt-2 h-28 w-28 rounded-full object-cover ring-2 ring-[#f7c600]" />
        ) : (
          <span className="mt-2 flex h-28 w-28 items-center justify-center rounded-full bg-[#07542f] text-3xl font-black uppercase text-[#f7c600] ring-2 ring-[#f7c600]" aria-hidden="true">
            {monogram(person.name)}
          </span>
        )}
        <h3 className="mt-4 text-xl font-black uppercase leading-tight">{person.name}</h3>
        <p className="mt-1 text-sm font-bold uppercase tracking-wide text-[#07542f]">{person.position}</p>
      </article>
    </div>
  );
}

// Connecteur vertical doré entre deux étages.
function VConnector() {
  return <span className="h-10 w-px bg-gradient-to-b from-[#f7c600] to-[#f7c600]/30" aria-hidden="true" />;
}

// Un étage de l'arbre : rail horizontal (desktop) + cartes avec un stub vertical (desktop).
function GovLevel({ people, featured, cols }: { people: DisplayOfficial[]; featured: boolean; cols: string }) {
  return (
    <div className="w-full">
      <div className="mx-auto hidden h-px w-2/3 bg-gradient-to-r from-transparent via-[#f7c600]/70 to-transparent lg:block" aria-hidden="true" />
      <div className={`mt-6 grid justify-center gap-6 sm:grid-cols-2 ${cols}`}>
        {people.map((person) => (
          <div
            key={person.id}
            className="relative flex justify-center lg:before:absolute lg:before:-top-6 lg:before:left-1/2 lg:before:h-6 lg:before:w-px lg:before:-translate-x-1/2 lg:before:bg-[#f7c600]/60"
          >
            <div className="w-full max-w-[16rem] transition duration-200 hover:-translate-y-1">
              <OfficialCard official={person} featured={featured} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function OrganizationPage() {
  const [{ organigramme }, officials] = await Promise.all([getSiteSettings(), getClubOfficials()]);

  // Président = membre du bureau dont le poste contient « président » (hors « vice »).
  const president = officials.bureau.find((o) => /pr[ée]sident/i.test(o.position) && !/vice/i.test(o.position)) ?? null;
  const bureauRest = president ? officials.bureau.filter((o) => o.id !== president.id) : officials.bureau;
  const dirigeants = officials.dirigeants;
  const hasTree = Boolean(president) || bureauRest.length > 0 || dirigeants.length > 0;

  return (
    <>
      <PageHero eyebrow="Le Club" description="Une organisation claire pour accompagner les licenciés, les familles et les éducateurs." image={images.training} title="Organigramme" />

      {hasTree ? (
        <section className="ac-pitch px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-6xl">
            <SectionTitle
              inverse
              centered
              eyebrow="Gouvernance"
              title="Une gouvernance lisible, de haut en bas"
              text="Du bureau exécutif aux dirigeants, chaque rôle est identifié pour accompagner les licenciés et les familles."
            />
            <div className="mt-12 flex flex-col items-center" aria-label="Organigramme de la gouvernance">
              {president ? (
                <>
                  <PresidentCard person={president} />
                  {bureauRest.length > 0 || dirigeants.length > 0 ? <VConnector /> : null}
                </>
              ) : null}

              {bureauRest.length > 0 ? <GovLevel people={bureauRest} featured cols="lg:grid-cols-3" /> : null}

              {dirigeants.length > 0 ? (
                <>
                  <VConnector />
                  <GovLevel people={dirigeants} featured={false} cols="lg:grid-cols-4" />
                </>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Structure du club : les pôles */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Structure" title={organigramme.title} text={organigramme.intro} />
        <div className="grid gap-5 md:grid-cols-2">
          {organigramme.groups.map((group, index) => (
            <article className="ac-frame relative overflow-hidden p-7" key={group.title}>
              <span className="ac-accent-bar" aria-hidden="true" />
              <span className="pointer-events-none absolute right-5 top-2 text-6xl font-black tabular-nums text-[#002f1d]/[0.06]" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="relative text-2xl font-black uppercase text-[#002f1d]">{group.title}</h2>
              <p className="relative mt-3 leading-7 text-slate-700">{group.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Fonctionnement */}
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
