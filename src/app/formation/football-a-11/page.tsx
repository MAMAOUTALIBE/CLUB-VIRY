import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { FeatureCards } from "@/components/FeatureCards";
import { StaffDirectory } from "@/components/club/ClubPublicBlocks";
import { footA11Educators } from "@/lib/club-pages-data";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";
import { ClipboardList, GraduationCap, ShieldCheck } from "lucide-react";

export const metadata = pageMetadata("/formation/football-a-11");

export default function FootballA11Page() {
  return (
    <>
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
    </>
  );
}
