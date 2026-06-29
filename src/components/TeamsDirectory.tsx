"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Stagger, StaggerItem } from "@/components/Motion";

type TeamCard = {
  slug: string;
  name: string;
  category: string;
  season: string;
  description: string;
  image: string;
};

const filters = ["Toutes", "École de foot", "Jeunes", "Seniors", "Féminines", "Futsal"] as const;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function matchesFilter(team: TeamCard, filter: (typeof filters)[number]) {
  if (filter === "Toutes") {
    return true;
  }

  const haystack = normalize(`${team.name} ${team.category}`);

  if (filter === "École de foot") {
    return haystack.includes("ecole") || haystack.includes("u6") || haystack.includes("u11");
  }

  if (filter === "Jeunes") {
    return haystack.includes("jeune") || haystack.includes("formation") || /\bu(1[2-9]|[6-9])\b/.test(haystack);
  }

  return haystack.includes(normalize(filter));
}

export function TeamsDirectory({ teams }: { teams: TeamCard[] }) {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Toutes");
  const visibleTeams = useMemo(() => teams.filter((team) => matchesFilter(team, activeFilter)), [activeFilter, teams]);

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2" aria-label="Filtrer les équipes">
        {filters.map((filter) => {
          const active = filter === activeFilter;
          return (
            <button
              aria-pressed={active}
              className={`focus-ring rounded-full border px-3 py-2 text-xs font-black uppercase transition ${
                active ? "border-[#f7c600] bg-[#f7c600] text-[#002f1d]" : "border-[#002f1d]/15 bg-white text-[#002f1d] hover:border-[#07542f] hover:bg-[#07542f]/10"
              }`}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {visibleTeams.length} équipe{visibleTeams.length > 1 ? "s" : ""} affichée{visibleTeams.length > 1 ? "s" : ""}.
      </p>

      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6">
        {visibleTeams.map((team) => (
          <StaggerItem key={team.slug}>
            <Link className="focus-ring premium-card group block overflow-hidden rounded-lg bg-white" href={`/equipes/${team.slug}`}>
              <div className="relative h-56 overflow-hidden">
                <Image src={team.image} alt={team.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, (max-width: 1920px) 25vw, 18vw" className="object-cover transition group-hover:scale-105" />
                <span className="absolute left-4 top-4 z-[1] rounded bg-[#f7c600] px-3 py-1 text-xs font-black uppercase text-[#002f1d]">{team.season}</span>
              </div>
              <div className="p-5">
                <p className="text-sm font-black uppercase text-[#664d00]">{team.category}</p>
                <h2 className="text-2xl font-black uppercase text-[#002f1d]">{team.name}</h2>
                <p className="mt-2 text-sm text-slate-700">{team.description}</p>
                <p className="mt-4 text-xs font-black uppercase text-[#002f1d]">Voir la fiche équipe</p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </>
  );
}
