import { Award, Building2, HeartHandshake, ShieldCheck, Users } from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { FeatureCards } from "@/components/FeatureCards";
import { PremiumCta } from "@/components/PremiumCta";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { iconByName } from "@/lib/icon-map";
import { images } from "@/lib/images";
import { getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club");
export const dynamic = "force-dynamic";

export default async function ClubPage() {
  const settings = await getSiteSettings();
  const clubStats = settings.club_stats;
  const values = settings.values;
  return (
    <>
      <PageHero
        description="Fondé en 1958, l'ES Viry-Châtillon Football est un club formateur, ambitieux et attaché à son territoire."
        eyebrow="Le Club"
        image={images.stadiumAerial}
        title="Notre histoire, nos valeurs, notre maison"
      >
        <div className="flex flex-wrap gap-4">
          <ButtonLink href="/le-club/histoire">Découvrir l'histoire</ButtonLink>
          <ButtonLink href="/le-club/stade-henri-longuet" variant="outline">
            Voir le stade
          </ButtonLink>
        </div>
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle title="Le club en chiffres" text="Des équipes de l'école de foot aux seniors, le club accompagne toutes les générations." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {clubStats.map((stat) => {
            const Icon = iconByName(stat.iconName);
            return (
              <article className="official-card rounded-lg bg-white p-6" key={stat.label}>
                <Icon className="text-[#f7c600]" size={38} aria-hidden="true" />
                <p className="mt-4 text-3xl font-black text-[#002f1d]">{stat.value}</p>
                <p className="text-sm font-black uppercase text-slate-700">{stat.label}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Identité"
          title="Un club structuré, familial et ambitieux"
          text="Sérieux, proximité, formation, passion et exigence : les valeurs qui guident l’ES Viry-Châtillon."
        />
        <FeatureCards
          items={[
            { title: "Formation", text: "Accompagner chaque joueur avec une progression lisible et durable.", icon: Award },
            { title: "Territoire", text: "Porter Viry-Châtillon avec fierté dans toute l'Essonne.", icon: Building2 },
            { title: "Famille", text: "Créer un cadre rassurant pour les parents, les joueurs et les bénévoles.", icon: Users },
            { title: "Ambition", text: "Structurer le club pour viser plus haut sans perdre son identité.", icon: ShieldCheck },
            { title: "Solidarité", text: "Faire grandir le collectif avant les individualités.", icon: HeartHandshake }
          ]}
        />
      </section>
      <section className="club-shell px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black uppercase text-[#f7c600]">Nos valeurs</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {values.map((value) => {
              const Icon = iconByName(value.iconName);
              return (
                <article className="rounded-lg border border-white/15 p-5" key={value.title}>
                  <Icon className="text-[#f7c600]" size={34} aria-hidden="true" />
                  <h3 className="mt-4 font-black uppercase">{value.title}</h3>
                  <p className="mt-2 text-sm text-white/75">{value.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <PremiumCta
        primaryHref="/inscriptions"
        primaryLabel="Rejoindre le club"
        secondaryHref="/partenaires"
        secondaryLabel="Devenir partenaire"
        text="Chaque saison rassemble joueurs, familles et partenaires autour du club."
        title="Construisons ensemble la prochaine saison jaune et verte"
      />
    </>
  );
}
