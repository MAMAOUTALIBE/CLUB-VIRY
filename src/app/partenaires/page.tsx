import { BadgeEuro, Eye, Handshake, Megaphone } from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { FeatureCards } from "@/components/FeatureCards";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { partners } from "@/lib/data";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/partenaires");

export default function PartnersPage() {
  return (
    <>
      <PageHero description="Associez votre image à un club formateur et populaire du territoire." image={images.supporters} title="Partenaires" />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div className="club-panel rounded-lg p-6 text-white">
          <h2 className="text-3xl font-black uppercase text-[#f7c600]">Devenez partenaire du club</h2>
          <p className="mt-4 text-white/80">Visibilité locale, visibilité stade, événements, textile, médias : construisons une offre adaptée.</p>
          <div className="mt-6">
            <ButtonLink href="/contact">Découvrir nos offres</ButtonLink>
          </div>
        </div>
        <div>
          <SectionTitle title="Ils nous font confiance" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <div className="official-card rounded-lg bg-white p-6 text-center text-xl font-black text-[#002f1d]" key={partner}>
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Offres" title="Devenez partenaire du club" text="Ce que vous y gagnez : visibilité, proximité, impact local et image positive." />
        <FeatureCards
          items={[
            { title: "Visibilité", text: "Présence sur le site, les supports et les temps forts du club.", icon: Eye },
            { title: "Territoire", text: "Associer son image à un club populaire et familial.", icon: Handshake },
            { title: "Communication", text: "Valoriser les partenaires dans les contenus et événements.", icon: Megaphone },
            { title: "Impact local", text: "Soutenir la jeunesse, le sport et la vie associative.", icon: BadgeEuro }
          ]}
        />
      </section>
    </>
  );
}
