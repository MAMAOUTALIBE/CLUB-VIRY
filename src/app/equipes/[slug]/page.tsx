import { PlayCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { PremiumCta } from "@/components/PremiumCta";
import { Stagger, StaggerItem } from "@/components/Motion";
import { PageHero } from "@/components/PageHero";
import { getPublicTeamBySlug } from "@/lib/public-content";
import { buildBreadcrumb, buildSportsTeam } from "@/lib/jsonld";

export const dynamic = "force-dynamic";

type TeamPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: TeamPageProps) {
  const { slug } = await params;
  const team = await getPublicTeamBySlug(slug);

  if (!team) {
    return { title: "Équipe" };
  }

  return {
    title: team.name,
    description: team.description,
    alternates: { canonical: `/equipes/${team.slug}` },
    openGraph: {
      title: `${team.name} — ES Viry-Châtillon`,
      description: team.description,
      images: [team.image],
      type: "website"
    }
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params;
  const team = await getPublicTeamBySlug(slug);

  if (!team) {
    notFound();
  }

  const teamJsonLd = buildSportsTeam(team);
  const breadcrumbJsonLd = buildBreadcrumb([
    { name: "Accueil", path: "/" },
    { name: "Équipes", path: "/equipes" },
    { name: team.name }
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(teamJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
              <p className="text-sm font-black uppercase text-slate-500">Catégorie</p>
              <p className="mt-1 font-black">{team.category}</p>
            </div>
            <div>
              <p className="text-sm font-black uppercase text-slate-500">Prochain match</p>
              <p className="mt-1 font-black">{team.nextMatch}</p>
            </div>
          </div>

          {team.staff.length > 0 ? (
            <>
              <h3 className="mt-8 text-xl font-black uppercase text-[#002f1d]">Encadrement</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {team.staff.map((member) => (
                  <li className="rounded-md border border-[#002f1d]/10 bg-[#fbfcf8] p-4" key={`${member.name}-${member.role}`}>
                    <p className="text-xs font-black uppercase text-[#8a6d00]">{member.role}</p>
                    <p className="mt-1 text-sm font-black text-[#002f1d]">{member.name}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <h3 className="mt-8 text-xl font-black uppercase text-[#002f1d]">Joueurs</h3>
          {team.players.length > 0 ? (
            <Stagger className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {team.players.map((player, index) => (
                <StaggerItem className="flex items-center gap-3 rounded-md bg-slate-100 px-4 py-3 text-sm font-bold" key={`${player.name}-${index}`}>
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#002f1d] px-2 text-xs font-black text-[#f7c600]">{player.shirtNumber ?? "—"}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[#002f1d]">{player.name}</span>
                    {player.position ? <span className="block text-xs font-medium text-slate-500">{player.position}</span> : null}
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-slate-300 bg-[#fbfcf8] p-4 text-sm font-bold text-slate-500">L'effectif sera publié prochainement.</p>
          )}
        </div>
        <aside className="club-panel rounded-lg p-6 text-white">
          <h2 className="text-xl font-black uppercase text-[#f7c600]">Classement</h2>
          <p className="mt-5 text-sm text-white/80">Le classement officiel sera affiché ici dès la publication des résultats par le district / la ligue.</p>
          <div className="mt-6">
            <ButtonLink href="/equipes">Toutes les équipes</ButtonLink>
          </div>
        </aside>
      </section>
      {team.media.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase text-[#002f1d]">Médias de l'équipe</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.media.map((item) => (
              <a
                className="focus-ring official-card group block overflow-hidden rounded-lg bg-white"
                href={item.url}
                key={item.url}
                rel="noopener noreferrer"
                target="_blank"
                title={item.title}
              >
                <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-[#002f1d]">
                  {item.type === "VIDEO" && !item.thumbnail ? (
                    <PlayCircle className="text-[#f7c600]" size={48} aria-hidden="true" />
                  ) : (
                    <img alt={item.title} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" src={item.thumbnail || item.url} />
                  )}
                </div>
                <p className="p-3 text-sm font-black uppercase text-[#002f1d]">{item.title}</p>
              </a>
            ))}
          </div>
        </section>
      ) : null}
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
