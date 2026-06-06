import Link from "next/link";
import { PremiumCta } from "@/components/PremiumCta";
import { Stagger, StaggerItem } from "@/components/Motion";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { teams } from "@/lib/data";
import { images } from "@/lib/images";

export const metadata = {
  title: "Équipes"
};

export default function TeamsPage() {
  return (
    <>
      <PageHero description="De l'école de foot aux Seniors, retrouvez toutes les catégories du club." image={images.teamHuddle} title="Nos équipes" />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle eyebrow="Toutes les équipes" title="De l'école de foot aux Seniors" text="Un parcours sportif lisible, du premier ballon aux équipes seniors." />
          <div className="mb-8 flex flex-wrap gap-2">
            {["Toutes", "École de foot", "Jeunes", "Seniors", "Féminines", "Futsal"].map((filter) => (
              <span className="rounded-full border border-[#002f1d]/15 bg-white px-3 py-2 text-xs font-black uppercase text-[#002f1d]" key={filter}>
                {filter}
              </span>
            ))}
          </div>
        </div>
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <StaggerItem key={team.slug}>
            <Link className="focus-ring premium-card group block overflow-hidden rounded-lg bg-white" href={`/equipes/${team.slug}`}>
              <div className="relative">
                <img alt="" className="h-56 w-full object-cover transition group-hover:scale-105" src={team.image} />
                <span className="absolute left-4 top-4 rounded bg-[#f7c600] px-3 py-1 text-xs font-black uppercase text-[#002f1d]">{team.season}</span>
              </div>
              <div className="p-5">
                <p className="text-sm font-black uppercase text-[#f7c600]">{team.category}</p>
                <h2 className="text-2xl font-black uppercase text-[#002f1d]">{team.name}</h2>
                <p className="mt-2 text-sm text-slate-700">{team.description}</p>
                <p className="mt-4 text-xs font-black uppercase text-[#002f1d]">Voir la fiche équipe</p>
              </div>
            </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <PremiumCta
        primaryHref="/inscriptions"
        primaryLabel="Rejoindre une équipe"
        secondaryHref="/detections-recrutement"
        secondaryLabel="Candidater aux détections"
        text="Chaque catégorie doit donner envie aux joueurs et aux parents de rejoindre une structure sérieuse."
        title="Votre enfant a sa place dans la famille Viry"
      />
    </>
  );
}
