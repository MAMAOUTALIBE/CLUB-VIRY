import { FeatureCards } from "@/components/FeatureCards";
import { DesktopOnly, MobileScreen } from "@/components/MobilePage";
import { PremiumCta } from "@/components/PremiumCta";
import { RegistrationForm } from "@/components/Forms";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { iconByName } from "@/lib/icon-map";
import { images } from "@/lib/images";
import { getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/inscriptions");
export const dynamic = "force-dynamic"; // CMS : contenu éditorial à jour immédiatement

export default async function RegistrationPage() {
  const { inscriptionsPage } = await getSiteSettings();
  return (
    <>
      <MobileScreen
        eyebrow="Inscriptions"
        title="Saison 2025 / 2026"
        scrollable
      >
        <div className="grid gap-3 pb-2">
          <RegistrationForm />
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero description={inscriptionsPage.heroDescription} image={images.youthTeam} title="Inscriptions 2025 / 2026" />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 3xl:grid-cols-[0.72fr_minmax(0,0.95fr)] 3xl:justify-center">
        <div>
          <SectionTitle title="Comment s'inscrire ?" text="Préparez les pièces demandées, remplissez le formulaire puis le club vous recontacte pour finaliser la licence." />
          <div className="grid gap-4 2xl:grid-cols-2 3xl:grid-cols-1">
            {inscriptionsPage.steps.map((step, index) => (
              <div className="official-card rounded-lg bg-white p-5" key={step}>
                <p className="text-sm font-black uppercase text-[#664d00]">Étape {index + 1}</p>
                <h2 className="mt-1 text-xl font-black uppercase text-[#002f1d]">{step}</h2>
              </div>
            ))}
          </div>
        </div>
        <RegistrationForm />
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Parents & joueurs" title="Un parcours clair, rassurant et efficace" text="Des informations simples, des étapes lisibles, et l'accompagnement du club à chaque étape." />
        <FeatureCards items={inscriptionsPage.features.map((feature) => ({ title: feature.title, text: feature.text, icon: iconByName(feature.iconName) }))} />
      </section>
      <PremiumCta
        primaryHref="/contact"
        primaryLabel="Poser une question"
        secondaryHref="/equipes"
        secondaryLabel="Voir les équipes"
        text="Une inscription réussie commence par une information claire et une expérience rassurante."
        title="Besoin d'aide pour choisir la bonne catégorie ?"
      />
      </DesktopOnly>
    </>
  );
}
