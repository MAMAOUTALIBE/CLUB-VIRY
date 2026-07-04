"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, GraduationCap, Mail, Quote, Trophy, Users } from "lucide-react";

import { DesktopOnly, MobileCard, MobileLinkCard, MobileScreen } from "@/components/MobilePage";
import type { DisplayEducator } from "@/lib/public-content";
import { ContactForm, DiplomaBadge, EducatorBanner, StatBlock, TeamChip, firstName } from "@/components/educator/EducatorsDirectory";

// Page détail (publique, partageable, SEO) d'un éducateur. Réutilise les atomes
// de l'annuaire pour rester cohérent avec la fiche modale.
export function EducatorProfilePage({ educator }: { educator: DisplayEducator }) {
  return (
    <>
      <MobileScreen
        eyebrow="Éducateur"
        title={educator.name}
        actions={[{ href: "/le-club/encadrement", label: "Retour", variant: "secondary" }]}
        scrollable
      >
        <div className="grid gap-3 pb-2">
          <MobileCard>
            <p className="text-xs font-black uppercase text-[#664d00]">Rôle</p>
            <h2 className="mt-1 text-lg font-black uppercase text-[#002f1d]">{educator.title}</h2>
            {educator.diploma ? <p className="mt-2 text-sm font-bold text-slate-700">{educator.diploma}</p> : null}
          </MobileCard>
          {educator.teams.length > 0 ? (
            <div className="grid gap-3">
              {educator.teams.slice(0, 4).map((team) => (
                <MobileLinkCard href={`/equipes/${team.slug}`} key={`${team.slug}-${team.roleTitle}`}>
                  <p className="text-xs font-black uppercase text-[#664d00]">{team.roleTitle}</p>
                  <h2 className="mt-1 text-lg font-black uppercase text-[#002f1d]">{team.name}</h2>
                </MobileLinkCard>
              ))}
            </div>
          ) : null}
        </div>
      </MobileScreen>
      <DesktopOnly>
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/le-club/encadrement"
        className="focus-ring inline-flex items-center gap-1.5 text-sm font-bold text-[#07542f] transition hover:text-[#002f1d]"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Retour à l'encadrement
      </Link>

      <div className="mt-5 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5">
        {/* Bannière hero */}
        <div className="relative">
          <EducatorBanner educator={educator} className="h-56 sm:h-72" showBadge={false} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            {educator.diploma ? <DiplomaBadge diploma={educator.diploma} className="mb-2" /> : null}
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f7c600]">Éducateur du club</p>
            <h1 className="mt-1 text-3xl font-black uppercase leading-tight text-white sm:text-4xl">{educator.name}</h1>
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-bold text-[#f7c600]">
              <GraduationCap size={16} aria-hidden="true" />
              {educator.title}
            </p>
          </div>
        </div>
        <div aria-hidden="true" className="h-1 w-full bg-gradient-to-r from-[#f7c600] via-[#ffd84d] to-[#f7c600]" />

        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Colonne gauche : informations */}
          <div className="space-y-6 text-[#002f1d]">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Users, value: educator.stats.teams, label: educator.stats.teams > 1 ? "Équipes" : "Équipe" },
                { icon: CalendarDays, value: educator.stats.sessions, label: "Séances" },
                { icon: Trophy, value: educator.stats.matches, label: "Matchs" }
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-black/5 bg-[#f7f7f5] p-4">
                  <StatBlock icon={stat.icon} value={stat.value} label={stat.label} />
                </div>
              ))}
            </div>

            {educator.quote ? (
              <figure className="rounded-2xl border-l-4 border-[#f7c600] bg-[#f7f7f5] p-4">
                <Quote size={18} className="text-[#f7c600]" aria-hidden="true" />
                <blockquote className="mt-1 text-base italic leading-7">« {educator.quote} »</blockquote>
              </figure>
            ) : null}

            {educator.joinedYear || educator.diplomas.length > 0 ? (
              <div>
                <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-black/45">
                  <span className="h-3 w-1 rounded-full bg-[#f7c600]" aria-hidden="true" />
                  Diplômes &amp; parcours
                </h2>
                {educator.joinedYear ? (
                  <p className="mt-2 text-sm text-black/60">
                    Au club depuis <span className="font-bold text-[#002f1d]">{educator.joinedYear}</span>
                  </p>
                ) : null}
                {educator.diplomas.length > 0 ? (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {educator.diplomas.map((d) => (
                      <li key={d}>
                        <DiplomaBadge diploma={d} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {educator.specialties.length > 0 ? (
              <div>
                <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-black/45">
                  <span className="h-3 w-1 rounded-full bg-[#f7c600]" aria-hidden="true" />
                  Spécialités
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {educator.specialties.map((s) => (
                    <span key={s} className="rounded-full bg-[#07542f]/[0.08] px-3 py-1 text-xs font-black uppercase text-[#07542f]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {educator.bio ? (
              <div>
                <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-black/45">
                  <span className="h-3 w-1 rounded-full bg-[#f7c600]" aria-hidden="true" />
                  À propos
                </h2>
                <p className="mt-2 text-sm leading-7 text-black/70">{educator.bio}</p>
              </div>
            ) : null}

            {educator.teams.length > 0 ? (
              <div>
                <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-black/45">
                  <span className="h-3 w-1 rounded-full bg-[#f7c600]" aria-hidden="true" />
                  Équipes encadrées
                </h2>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {educator.teams.map((team) => (
                    <Link key={`${team.slug}-${team.roleTitle}`} href={`/equipes/${team.slug}`} className="focus-ring rounded-full">
                      <TeamChip team={team} />
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Colonne droite : contact */}
          <aside>
            <div className="rounded-2xl border border-black/5 bg-[#f7f7f5] p-5 lg:sticky lg:top-24">
              <h2 className="flex items-center gap-2 text-sm font-black uppercase text-[#002f1d]">
                <Mail size={16} className="text-[#07542f]" aria-hidden="true" />
                Écrire à {firstName(educator.name)}
              </h2>
              <div className="mt-3">
                <ContactForm educator={educator} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
      </DesktopOnly>
    </>
  );
}
