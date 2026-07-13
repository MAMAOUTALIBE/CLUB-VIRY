import { ButtonLink } from "@/components/ButtonLink";
import { FeatureCards } from "@/components/FeatureCards";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { SchoolProjectTimeline } from "@/components/club/ClubPublicBlocks";
import { images } from "@/lib/images";
import { getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";
import { Dumbbell, HeartHandshake, Route, ShieldCheck, Trophy, Users } from "lucide-react";

export const metadata = pageMetadata("/formation/projet-ecole-de-foot");
export const dynamic = "force-dynamic"; // CMS : feuille de route à jour immédiatement

export default async function ProjetEcoleDeFootPage() {
  const { formationProjet: schoolProject } = await getSiteSettings();
  return (
    <>
      <MobileScreen
        eyebrow="Projet"
        title="École de foot"
        actions={[{ href: "/formation/ecole-de-foot", label: "Éducateurs" }]}
      >
        <div className="grid h-full content-start gap-3 md:grid-cols-2">
          {schoolProject.slice(0, 4).map((item) => (
            <MobileCard key={item.year}>
              <p className="text-xs font-black uppercase text-[#664d00]">{item.year}</p>
              <h2 className="mt-1 text-lg font-black uppercase text-[#002f1d]">{item.title}</h2>
            </MobileCard>
          ))}
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero
        eyebrow="Projet"
        description="Le projet école de foot fixe un cadre commun pour accueillir, former et accompagner les jeunes joueurs dans la durée."
        image={images.youthTeam}
        title="Projet école de foot"
      >
        <ButtonLink href="/formation/ecole-de-foot">Voir les éducateurs</ButtonLink>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Ambition" title="Former des joueurs, accompagner des enfants" text="Le projet ne se limite pas au terrain : il donne des repères aux familles, aux éducateurs et aux bénévoles." />
        <FeatureCards
          items={[
            { title: "Accueil", text: "Un cadre rassurant pour les premières saisons au club.", icon: HeartHandshake },
            { title: "Plaisir", text: "Des séances vivantes qui donnent envie de revenir.", icon: Trophy },
            { title: "Progression", text: "Des objectifs adaptés à chaque tranche d'âge.", icon: Route },
            { title: "Respect", text: "Des règles simples, répétées et partagées.", icon: ShieldCheck },
            { title: "Collectif", text: "Apprendre à jouer avec les autres et pour les autres.", icon: Users },
            { title: "Éducateurs", text: "Une ligne pédagogique commune pour tous les groupes.", icon: Dumbbell }
          ]}
        />
      </section>

      <section className="bg-[#f7f8f4] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Feuille de route" title="Objectifs structurants" text="Données de démonstration, prêtes à être remplacées par la version officielle du projet club." />
          <SchoolProjectTimeline items={schoolProject} />
        </div>
      </section>
      </DesktopOnly>
    </>
  );
}
