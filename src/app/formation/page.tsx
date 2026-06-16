import Link from "next/link";
import { ArrowRight, CalendarDays, GraduationCap, Target, Users } from "lucide-react";

import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/formation");

const sections = [
  {
    href: "/formation/ecole-de-foot",
    title: "École de foot",
    text: "Catégories U6 à U13 : éducateurs référents, créneaux indicatifs et repères de progression pour les familles.",
    icon: GraduationCap
  },
  {
    href: "/formation/football-a-11",
    title: "Football à 11",
    text: "Encadrement des U14 aux Seniors : projet de jeu, suivi des joueurs et exigences de la compétition.",
    icon: Users
  },
  {
    href: "/formation/projet-ecole-de-foot",
    title: "Projet école de foot",
    text: "Notre feuille de route de formation : accueil, respect, progression et parcours du jeune joueur.",
    icon: Target
  },
  {
    href: "/formation/stages",
    title: "Stages",
    text: "Stages vacances et de perfectionnement : dates indicatives, contenus et demandes d'information.",
    icon: CalendarDays
  }
];

export default function FormationPage() {
  return (
    <>
      <PageHero
        eyebrow="Formation"
        description="De l'école de foot aux Seniors, l'ES Viry-Châtillon forme ses joueurs avec un projet clair, des éducateurs diplômés et un cadre exigeant. Explorez les différentes facettes de la formation au club."
        image={images.training}
        title="La formation au club"
      >
        <ButtonLink href="/inscriptions">Rejoindre le club</ButtonLink>
      </PageHero>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Parcours de formation"
            title="Explorer la formation"
            text="Quatre entrées pour comprendre l'organisation sportive du club, de l'accueil des plus jeunes aux stages de perfectionnement."
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className="premium-card focus-ring group flex flex-col rounded-xl p-6 transition"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#002f1d] text-[#f7c600]">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-xl font-black uppercase text-[#002f1d]">{section.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{section.text}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-black uppercase text-[#664d00] transition group-hover:gap-3">
                    Découvrir
                    <ArrowRight size={18} aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
