import { GraduationCap, Shield, Star, Users } from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { CoachesDirectory } from "@/components/club/CoachesDirectory";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { coachesByTeam, coaches } from "@/lib/club-pages-data";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/entraineurs");

export default function EntraineursPage() {
  const groups = coachesByTeam();
  const assistantCount = coaches.filter((coach) => /adjoint/i.test(coach.role)).length;
  const stats = [
    { icon: Users, value: coaches.length, label: coaches.length > 1 ? "Entraîneurs" : "Entraîneur" },
    { icon: Star, value: coaches.length - assistantCount, label: "Principaux" },
    { icon: Shield, value: assistantCount, label: "Adjoints" },
    { icon: GraduationCap, value: groups.length, label: groups.length > 1 ? "Équipes" : "Équipe" }
  ];

  return (
    <>
      <MobileScreen
        eyebrow="Le Club"
        title="Entraîneurs"
        actions={[{ href: "/equipes", label: "Équipes", variant: "secondary" }]}
        scrollable
      >
        <div className="grid gap-4 pb-2">
          {groups.map((group) => (
            <MobileCard key={group.team}>
              <p className="text-xs font-black uppercase text-[#664d00]">{group.team}</p>
              <div className="gold-divider mt-2" aria-hidden="true" />
              <ul className="mt-3 grid gap-4">
                {group.members.map((coach) => {
                  const assistant = /adjoint/i.test(coach.role);
                  return (
                    <li key={coach.name} className="flex gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#002f1d] text-sm font-black uppercase text-[#f7c600] ring-1 ring-[#f7c600]/60">
                        {coach.name
                          .trim()
                          .split(/\s+/)
                          .filter(Boolean)
                          .map((part, index, parts) => (index === 0 || index === parts.length - 1 ? part.charAt(0) : ""))
                          .join("")
                          .toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="text-base font-black uppercase leading-tight text-[#002f1d]">{coach.name}</p>
                        <p className="text-xs font-bold uppercase text-black/55">
                          {assistant ? "Adjoint" : "Principal"} · {coach.role}
                        </p>
                        {coach.diplomas.length > 0 ? (
                          <p className="mt-1 text-xs text-black/60">Diplômes : {coach.diplomas.join(", ")}</p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </MobileCard>
          ))}
        </div>
      </MobileScreen>
      <DesktopOnly>
        <PageHero
          eyebrow="Le Club"
          description="Les entraîneurs et entraîneurs adjoints qui dirigent les équipes du club, avec leurs diplômes fédéraux."
          image={images.training}
          title="Les entraîneurs"
        >
          <ButtonLink href="/le-club/encadrement" variant="outline">
            Voir tout l&apos;encadrement sportif
          </ButtonLink>
        </PageHero>

        <section className="border-b border-black/5 bg-[#f7f8f4] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 text-center">
                <Icon size={22} className="text-[#07542f]" aria-hidden="true" />
                <span className="text-3xl font-black leading-none text-[#002f1d]">{value}</span>
                <span className="text-[11px] font-bold uppercase tracking-wide text-black/45">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Équipe par équipe"
            title="Qui dirige nos équipes"
            text="Cette page présente uniquement les entraîneurs et leurs adjoints. L'ensemble des éducateurs, référents et coordinateurs du club est présenté sur la page Encadrement."
          />

          {groups.length > 0 ? (
            <CoachesDirectory groups={groups} />
          ) : (
            <p className="club-panel mt-8 rounded-lg p-8 text-center text-white/80">
              Les entraîneurs des équipes seront présentés ici prochainement.
            </p>
          )}
        </section>
      </DesktopOnly>
    </>
  );
}
