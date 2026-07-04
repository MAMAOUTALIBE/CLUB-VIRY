import { Dumbbell, Eye, Send, Target } from "lucide-react";
import { FeatureCards } from "@/components/FeatureCards";
import { DesktopOnly, MobileScreen } from "@/components/MobilePage";
import { PremiumCta } from "@/components/PremiumCta";
import { RecruitmentForm } from "@/components/Forms";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/detections-recrutement");

export default function RecruitmentPage() {
  const categories = ["Football à 11", "Formation", "Seniors", "Féminines"];
  return (
    <>
      <MobileScreen
        eyebrow="Détections"
        title="Recrutement"
        description="Candidature étudiée par la cellule sportive selon le profil, l’état d’esprit et la catégorie."
        scrollable
      >
        <div className="grid gap-3 pb-2 md:grid-cols-[0.75fr_1.25fr]">
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <span className="rounded-md bg-[#002f1d] px-3 py-2 text-xs font-black uppercase text-[#f7c600]" key={item}>
                {item}
              </span>
            ))}
          </div>
          <RecruitmentForm />
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero
        description="Tu as le talent ? Nous sommes là pour t'aider à le développer."
        image={images.training}
        title="Détections / Recrutement"
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 3xl:grid-cols-[0.72fr_minmax(0,0.95fr)] 3xl:justify-center">
        <div>
          <SectionTitle title="Catégories concernées" text="Les candidatures sont étudiées par la cellule sportive du club." />
          <ul className="space-y-3">
            {["Football à 11", "Préformation et formation", "Seniors", "Féminines"].map((item) => (
              <li className="club-panel rounded-lg px-5 py-4 font-black uppercase text-white" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <RecruitmentForm />
      </section>
      <section className="club-shell px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle inverse eyebrow="Process" title="Un parcours talent clair" text="Un cadre exigeant et bienveillant pour révéler et accompagner les talents du territoire." />
          <FeatureCards
            inverse
            items={[
              { title: "Candidater", text: "Envoyer ses informations sportives de manière claire.", icon: Send },
              { title: "Observer", text: "Évaluer le potentiel, le comportement et l'état d'esprit.", icon: Eye },
              { title: "Progresser", text: "Accompagner le joueur selon son profil et sa catégorie.", icon: Dumbbell },
              { title: "Intégrer", text: "Rejoindre un groupe adapté aux ambitions du club.", icon: Target }
            ]}
          />
        </div>
      </section>
      <PremiumCta
        primaryHref="/equipes"
        primaryLabel="Voir les équipes"
        secondaryHref="/contact"
        secondaryLabel="Contacter le club"
        text="Tu as le talent et l'envie ? Rejoins un club ambitieux qui forme et fait progresser."
        title="Le talent se développe dans un cadre exigeant"
      />
      </DesktopOnly>
    </>
  );
}
