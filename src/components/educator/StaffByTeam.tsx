import Link from "next/link";
import { Shield, Star, Users } from "lucide-react";

import type { DisplayEducator } from "@/lib/public-content";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase() || "?";
}

type TeamGroup = {
  name: string;
  slug: string;
  category: string;
  members: { educator: DisplayEducator; roleTitle: string; isHeadCoach: boolean }[];
};

function groupByTeam(educators: DisplayEducator[]): TeamGroup[] {
  const map = new Map<string, TeamGroup>();
  for (const educator of educators) {
    for (const team of educator.teams) {
      const key = `${team.slug}::${team.name}`;
      if (!map.has(key)) {
        map.set(key, { name: team.name, slug: team.slug, category: team.category, members: [] });
      }
      map.get(key)!.members.push({ educator, roleTitle: team.roleTitle, isHeadCoach: team.isHeadCoach });
    }
  }
  return Array.from(map.values())
    .map((group) => ({
      ...group,
      members: group.members.sort((a, b) => Number(b.isHeadCoach) - Number(a.isHeadCoach))
    }))
    .sort((a, b) => a.category.localeCompare(b.category, "fr") || a.name.localeCompare(b.name, "fr"));
}

// Regroupe l'encadrement PAR équipe (répond à « qui encadre l'équipe de mon enfant ? »).
export function StaffByTeam({ educators }: { educators: DisplayEducator[] }) {
  const groups = groupByTeam(educators);
  if (groups.length === 0) return null;

  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <div key={`${group.slug}-${group.name}`} className="official-card rounded-2xl bg-white p-5 shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-3">
            <div className="min-w-0">
              <Link
                href={`/equipes/${group.slug}`}
                className="focus-ring block truncate text-base font-black uppercase text-[#002f1d] transition hover:text-[#07542f]"
              >
                {group.name}
              </Link>
              <p className="text-[11px] font-bold uppercase tracking-wide text-black/40">{group.category}</p>
            </div>
            <Users size={18} className="shrink-0 text-[#07542f]" aria-hidden="true" />
          </div>
          <ul className="mt-3 space-y-1.5">
            {group.members.map((member) => (
              <li key={`${member.educator.id}-${member.roleTitle}`}>
                <Link
                  href={`/le-club/encadrement/${member.educator.slug}`}
                  className="focus-ring group flex items-center gap-3 rounded-lg p-1 transition hover:bg-[#f7c600]/[0.08]"
                >
                  {member.educator.avatar ? (
                    <img src={member.educator.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-[#f7c600]" />
                  ) : (
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#07542f] text-xs font-black uppercase text-[#f7c600] ring-1 ring-[#f7c600]"
                      aria-hidden="true"
                    >
                      {initials(member.educator.name)}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black uppercase text-[#002f1d]">{member.educator.name}</span>
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#07542f]">
                      {member.isHeadCoach ? (
                        <Star size={11} className="text-[#f7c600]" aria-hidden="true" />
                      ) : (
                        <Shield size={11} aria-hidden="true" />
                      )}
                      {member.roleTitle}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
