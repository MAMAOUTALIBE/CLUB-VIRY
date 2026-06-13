import type { LucideIcon } from "lucide-react";
import { CalendarDays, GraduationCap, Shield, Star, Trophy, Users } from "lucide-react";

import type { DisplayEducator } from "@/lib/public-content";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase() || "?";
}

function Stat({ icon: Icon, value, label }: { icon: LucideIcon; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Icon size={18} className="text-[#07542f]" aria-hidden="true" />
      <span className="text-xl font-black leading-none">{value}</span>
      <span className="text-[11px] font-bold uppercase tracking-wide text-black/45">{label}</span>
    </div>
  );
}

export function EducatorCard({ educator }: { educator: DisplayEducator }) {
  const { name, title, avatar, bio, teams, stats } = educator;

  return (
    <article className="official-card flex flex-col overflow-hidden rounded-2xl bg-white text-[#002f1d] shadow-lg">
      <div className="flex items-center gap-4 border-b border-black/5 bg-[#f7f7f5] p-5">
        {avatar ? (
          <img src={avatar} alt={name} className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-[#f7c600]" />
        ) : (
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#07542f] text-lg font-black uppercase text-[#f7c600] ring-2 ring-[#f7c600]"
            aria-hidden="true"
          >
            {initials(name)}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black uppercase leading-tight">{name}</h3>
          <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-bold text-[#07542f]">
            <GraduationCap size={15} aria-hidden="true" />
            {title}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        {bio ? <p className="text-sm leading-6 text-black/70">{bio}</p> : null}

        {teams.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {teams.map((team) => (
              <span
                key={`${team.slug}-${team.roleTitle}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#07542f]/[0.08] px-3 py-1 text-xs font-black uppercase text-[#07542f]"
                title={team.roleTitle}
              >
                {team.isHeadCoach ? (
                  <Star size={13} className="text-[#f7c600]" aria-hidden="true" />
                ) : (
                  <Shield size={13} aria-hidden="true" />
                )}
                {team.name}
                <span className="font-bold text-black/45">· {team.category}</span>
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-black/5 pt-4 text-center">
          <Stat icon={Users} value={stats.teams} label={stats.teams > 1 ? "Équipes" : "Équipe"} />
          <Stat icon={CalendarDays} value={stats.sessions} label="Séances" />
          <Stat icon={Trophy} value={stats.matches} label="Matchs" />
        </div>
      </div>
    </article>
  );
}
