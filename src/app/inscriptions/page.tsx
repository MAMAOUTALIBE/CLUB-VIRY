import { FileCheck, ShieldCheck, Smile, Users } from "lucide-react";
import { FeatureCards } from "@/components/FeatureCards";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { PremiumCta } from "@/components/PremiumCta";
import { RegistrationForm } from "@/components/Forms";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/inscriptions");

export default function RegistrationPage() {
  return (
    <>
      <MobileScreen
        eyebrow="Inscriptions"
        title="Saison 2025 / 2026"
        description="Préparez les pièces, remplissez le formulaire, le club vous recontacte."
        scrollable
      >
        <div className="grid gap-3 pb-2">
          <div className="grid gap-2 md:grid-cols-4">
            {["Catégorie", "Formulaire", "Pièces", "Cotisation"].map((step, index) => (
              <MobileCard key={step}>
                <p className="text-xs font-black uppercase text-[#664d00]">Étape {index + 1}</p>
                <h2 className="text-base font-black uppercase text-[#002f1d]">{step}</h2>
              </MobileCard>
            ))}
          </div>
          <RegistrationForm />
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero description="Rejoignez la famille Viry pour la saison 2025 / 2026." image={images.youthTeam} title="Inscriptions 2025 / 2026" />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 3xl:grid-cols-[0.72fr_minmax(0,0.95fr)] 3xl:justify-center">
        <div>
          <SectionTitle title="Comment s'inscrire ?" text="Préparez les pièces demandées, remplissez le formulaire puis le club vous recontacte pour finaliser la licence." />
          <div className="grid gap-4 2xl:grid-cols-2 3xl:grid-cols-1">
            {["Choisir sa catégorie", "Remplir le formulaire en ligne", "Fournir les pièces demandées", "Paiement de la licence"].map((step, index) => (
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
        <FeatureCards
          items={[
            { title: "Catégories", text: "Identifier rapidement la bonne catégorie selon l'âge et le niveau.", icon: Users },
            { title: "Documents", text: "Préparer les pièces nécessaires sans perdre de temps.", icon: FileCheck },
            { title: "Accompagnement", text: "Être guidé par le club jusqu'à la validation de la licence.", icon: ShieldCheck },
            { title: "Bienvenue", text: "Intégrer un cadre familial, sérieux et ambitieux.", icon: Smile }
          ]}
        />
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
