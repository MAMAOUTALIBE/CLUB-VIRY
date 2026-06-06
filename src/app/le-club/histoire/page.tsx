import { PageHero } from "@/components/PageHero";
import { PremiumCta } from "@/components/PremiumCta";
import { SectionTitle } from "@/components/SectionTitle";
import { Reveal } from "@/components/Motion";
import { images } from "@/lib/images";

export const metadata = {
  title: "Histoire"
};

const timeline = [
  ["1967", "Création du club et premiers collectifs à Viry-Châtillon."],
  ["1980-90", "Développement de la formation et structuration des catégories jeunes."],
  ["2000", "Montée en exigences régionales et rayonnement local renforcé."],
  ["Aujourd'hui", "Un club familial, formateur et tourné vers l'avenir."]
];

export default function HistoryPage() {
  return (
    <>
      <PageHero description="Un club historique de l'Essonne, porté par des bénévoles, des éducateurs et des familles." image={images.stadiumAerial} title="Notre histoire" />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle title="Depuis 1967" text="L'ES Viry-Châtillon Football grandit avec sa ville. L'histoire du club est celle d'une transmission : former, rassembler et faire progresser." />
        <div className="relative grid gap-5">
          <div className="absolute left-6 top-0 hidden h-full w-px bg-[#f7c600]/60 sm:block" aria-hidden="true" />
          {timeline.map(([year, text], index) => (
            <Reveal key={year} delay={index * 0.06}>
              <article className="premium-card grid gap-4 rounded-lg bg-white p-6 sm:grid-cols-[90px_1fr] sm:items-center">
                <p className="text-4xl font-black text-[#f7c600]">{year}</p>
                <p className="text-lg leading-8 text-slate-700">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <PremiumCta
        primaryHref="/le-club/stade-henri-longuet"
        primaryLabel="Découvrir le stade"
        secondaryHref="/equipes"
        secondaryLabel="Voir les équipes"
        text="L'histoire du club continue chaque week-end, sur le terrain et autour des familles."
        title="Une histoire vivante, portée par le terrain"
      />
    </>
  );
}
