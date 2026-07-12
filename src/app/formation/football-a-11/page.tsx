import { ButtonLink } from "@/components/ButtonLink";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { FeatureCards } from "@/components/FeatureCards";
import { StaffDirectory } from "@/components/club/ClubPublicBlocks";
import { images } from "@/lib/images";
import { getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";
import { ClipboardList, GraduationCap, ShieldCheck } from "lucide-react";

export const metadata = pageMetadata("/formation/football-a-11");
export const dynamic = "force-dynamic"; // CMS : encadrement à jour immédiatement

export default async function FootballA11Page() {
  const { formationFootA11Educateurs: footA11Educators } = await getSiteSettings();
  return (
    <>
      <MobileScreen
        eyebrow="Formation"
        title="Football à 11"
        actions={[{ href: "/detections-recrutement", label: "Détections" }]}
        scrollable
      >
        <div className="grid gap-3 pb-2">
          {footA11Educators.slice(0, 6).map((person) => (
            <MobileCard key={person.name}>
              <p className="text-xs font-black uppercase text-[#664d00]">{person.category}</p>
              <h2 className="mt-1 text-lg font-black uppercase text-[#002f1d]">{person.name}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-700">{person.role}</p>
            </MobileCard>
          ))}
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero
        eyebrow="Formation"
        description="Une lecture claire de l'encadrement du football à 11, des U14 aux Seniors, avec les rôles sportifs et les catégories suivies."
        image={images.teamHuddle}
        title="Éducateurs du football à 11"
      >
        <ButtonLink href="/detections-recrutement">Candidater ou se faire détecter</ButtonLink>
      </PageHero>

      <StaffDirectory
        intro="Cette page présente les pôles et les éducateurs de référence. Les échanges opérationnels avec les familles restent gérés par les canaux officiels du club."
        people={footA11Educators}
      />

      <section className="club-shell px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle inverse eyebrow="Méthode" title="Un parcours construit par étape" text="Le football à 11 doit faire progresser le joueur techniquement, tactiquement et humainement." />
          <FeatureCards
            inverse
            items={[
              { title: "Projet de jeu", text: "Repères communs entre catégories pour donner une identité lisible.", icon: ClipboardList },
              { title: "Suivi joueur", text: "Observations régulières, passerelles et objectifs adaptés.", icon: GraduationCap },
              { title: "Cadre", text: "Exigence, respect et ponctualité au service du collectif.", icon: ShieldCheck }
            ]}
          />
        </div>
      </section>
      </DesktopOnly>
    </>
  );
}
