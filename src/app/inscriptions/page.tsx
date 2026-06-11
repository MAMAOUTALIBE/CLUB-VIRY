import { FileCheck, ShieldCheck, Smile, Users } from "lucide-react";
import { FeatureCards } from "@/components/FeatureCards";
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
      <PageHero description="Rejoignez la famille Viry pour la saison 2025 / 2026." image={images.youthTeam} title="Inscriptions 2025 / 2026" />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <SectionTitle title="Comment s'inscrire ?" text="Préparez les pièces demandées, remplissez le formulaire puis le club vous recontacte pour finaliser la licence." />
          <div className="grid gap-4">
            {["Choisir sa catégorie", "Remplir le formulaire en ligne", "Fournir les pièces demandées", "Paiement de la licence"].map((step, index) => (
              <div className="official-card rounded-lg bg-white p-5" key={step}>
                <p className="text-sm font-black uppercase text-[#8a6d00]">Étape {index + 1}</p>
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
    </>
  );
}
