import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { PremiumCta } from "@/components/PremiumCta";
import { Stagger, StaggerItem } from "@/components/Motion";
import { PageHero } from "@/components/PageHero";
import { teams } from "@/lib/data";

type TeamPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return teams.map((team) => ({ slug: team.slug }));
}

export async function generateMetadata({ params }: TeamPageProps) {
  const { slug } = await params;
  const team = teams.find((item) => item.slug === slug);
  return {
    title: team?.name ?? "Équipe"
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params;
  const team = teams.find((item) => item.slug === slug);

  if (!team) {
    notFound();
  }

  return (
    <>
      <PageHero description={team.description} eyebrow={team.season} image={team.image} title={team.name}>
        <ButtonLink href="/calendrier">Voir le calendrier</ButtonLink>
      </PageHero>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_0.7fr] lg:px-8">
        <div className="official-card rounded-lg bg-white p-6">
          <h2 className="text-3xl font-black uppercase text-[#002f1d]">Fiche équipe</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm font-black uppercase text-slate-500">Coach principal</p>
              <p className="mt-1 font-black">{team.coach}</p>
            </div>
            <div>
              <p className="text-sm font-black uppercase text-slate-500">Adjoint</p>
              <p className="mt-1 font-black">{team.assistant}</p>
            </div>
            <div>
              <p className="text-sm font-black uppercase text-slate-500">Prochain match</p>
              <p className="mt-1 font-black">{team.nextMatch}</p>
            </div>
          </div>
          <h3 className="mt-8 text-xl font-black uppercase text-[#002f1d]">Joueurs</h3>
          <Stagger className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {team.players.map((player) => (
              <StaggerItem className="rounded-md bg-slate-100 px-4 py-3 text-sm font-bold" key={player}>
                {player}
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {["Présentation", "Résultats", "Calendrier"].map((tab) => (
              <div className="rounded-md border border-[#002f1d]/10 bg-[#fbfcf8] p-4" key={tab}>
                <p className="text-xs font-black uppercase text-[#f7c600]">{tab}</p>
                <p className="mt-2 text-sm text-slate-700">Informations prêtes à être affichées dans une fiche officielle claire et lisible.</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="club-panel rounded-lg p-6 text-white">
          <h2 className="text-xl font-black uppercase text-[#f7c600]">Classement</h2>
          <p className="mt-5 text-sm text-white/80">Le classement officiel sera affiché ici dès la publication des résultats par le district / la ligue.</p>
          <div className="mt-6">
            <ButtonLink href="/equipes">Toutes les équipes</ButtonLink>
          </div>
        </aside>
      </section>
      <PremiumCta
        primaryHref="/equipes"
        primaryLabel="Toutes les équipes"
        secondaryHref="/calendrier"
        secondaryLabel="Voir les matchs"
        text="Le groupe, son staff et sa saison, présentés clairement."
        title={`${team.name}, un groupe qui porte le blason`}
      />
    </>
  );
}
