import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap, Shield, ShieldCheck, Star, Users } from "lucide-react";

import type { Coach } from "@/lib/club-pages-data";

/** Monogramme affiché quand aucune photo n'est disponible ("ABDEDDAIM Khaled" -> "AK"). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase() || "?";
}

/** Le rôle porte l'information principal/adjoint : pas de champ redondant à maintenir. */
function isAssistant(role: string): boolean {
  return /adjoint/i.test(role);
}

type CoachGroup = { team: string; teamSlug: string | null; members: Coach[] };

function CoachCard({ coach }: { coach: Coach }) {
  const assistant = isAssistant(coach.role);
  // Le 1er diplôme sert de badge sur la bannière ; la liste complète reste dans le corps.
  const mainDiploma = coach.diplomas[0];

  return (
    <article className="official-card group flex h-full flex-col overflow-hidden rounded-2xl bg-white text-[#002f1d] shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src="/stade/imagepelouse.webp"
          alt=""
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#001c10]/45" aria-hidden="true" />
        <span
          className={`absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase shadow-lg ${
            assistant ? "bg-white/90 text-[#07542f]" : "bg-[#f7c600] text-[#001c10]"
          }`}
        >
          {assistant ? <Shield size={12} aria-hidden="true" /> : <Star size={12} aria-hidden="true" />}
          {assistant ? "Adjoint" : "Principal"}
        </span>
        {mainDiploma ? (
          <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#07542f] px-3 py-1 text-xs font-black uppercase text-white shadow-lg ring-1 ring-[#f7c600]/40">
            <ShieldCheck size={13} className="text-[#f7c600]" aria-hidden="true" />
            {mainDiploma}
          </span>
        ) : null}
        <span className="absolute inset-0 z-[5] flex items-center justify-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#001c10]/82 text-3xl font-black uppercase text-[#f7c600] shadow-lg ring-2 ring-[#f7c600]/80">
            {initials(coach.name)}
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h4 className="text-lg font-black uppercase leading-tight">{coach.name}</h4>
        <p className="mt-0.5 text-sm font-semibold text-black/55">{coach.role}</p>
        <span className="mt-2 h-1 w-12 rounded-full bg-[#f7c600]" aria-hidden="true" />

        {/* Bloc diplômes omis (et non remplacé par un libellé d'attente) quand la
            donnée manque : rien d'administratif ne doit fuiter sur une page publique. */}
        <div className="mt-4 flex-1">
          {coach.diplomas.length > 0 ? (
            <>
              <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-black/45">
                <GraduationCap size={14} className="text-[#07542f]" aria-hidden="true" />
                {coach.diplomas.length > 1 ? "Diplômes" : "Diplôme"}
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {coach.diplomas.map((diploma) => (
                  <li
                    key={diploma}
                    className="rounded-full bg-[#002f1d]/[0.06] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#002f1d]/75"
                  >
                    {diploma}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        <span className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-[#07542f]/[0.08] px-2.5 py-1 text-[11px] font-black uppercase text-[#07542f]">
          <Users size={12} aria-hidden="true" />
          {coach.team}
        </span>
      </div>
    </article>
  );
}

export function CoachesDirectory({ groups }: { groups: CoachGroup[] }) {
  return (
    <div className="grid gap-12">
      {groups.map((group) => (
        <section key={group.team} aria-labelledby={`staff-${group.team.replace(/\s+/g, "-").toLowerCase()}`}>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#002f1d]/10 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[#664d00]">Équipe</p>
              <h3
                id={`staff-${group.team.replace(/\s+/g, "-").toLowerCase()}`}
                className="mt-1 text-2xl font-black uppercase text-[#002f1d] sm:text-3xl"
              >
                {group.team}
              </h3>
              <div className="gold-divider mt-3" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-black/50">
                {group.members.length} encadrant{group.members.length > 1 ? "s" : ""}
              </span>
              {group.teamSlug ? (
                <Link
                  href={`/equipes/${group.teamSlug}`}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-[#002f1d] px-4 py-2 text-xs font-black uppercase text-white transition hover:bg-[#07542f]"
                >
                  Voir l&apos;équipe
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {group.members.map((coach) => (
              <CoachCard key={`${coach.team}-${coach.name}`} coach={coach} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
