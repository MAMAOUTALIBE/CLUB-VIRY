import { Home, MapPin, Users, Waves } from "lucide-react";
import { FeatureCards } from "@/components/FeatureCards";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { images } from "@/lib/images";

export const metadata = {
  title: "Stade Henri Longuet"
};

export default function StadiumPage() {
  return (
    <>
      <PageHero
        description="Notre maison, notre fierté. Un lieu de vie sportive au coeur de Viry-Châtillon."
        image={images.stadiumAerial}
        title="Stade Henri Longuet"
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div>
          <SectionTitle title="Infrastructures" text="Terrains, vestiaires, club house et tribunes pour accueillir licenciés, familles et visiteurs." />
          <div className="grid gap-4 sm:grid-cols-2">
            {["2 terrains", "Vestiaires modernes", "Club house convivial", "Tribunes supporters"].map((item) => (
              <div className="official-card rounded-lg bg-white p-5 font-black uppercase text-[#002f1d]" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="club-panel rounded-lg p-6 text-white">
          <MapPin className="text-[#f7c600]" size={38} aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black uppercase">Adresse</h2>
          <p className="mt-3">Stade Henri Longuet, Avenue de l'Armée Leclerc, 91170 Viry-Châtillon</p>
          <div className="mt-6 overflow-hidden rounded-lg">
            <iframe className="h-64 w-full rounded-lg" title="Localisation du Stade Henri Longuet à Viry-Châtillon" src="https://www.google.com/maps?q=Stade%20Henri%20Longuet%2C%20Viry-Ch%C3%A2tillon&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Lieu de vie" title="Plus qu'un terrain, une maison" text="Un point de rassemblement : matchs, entraînements, familles, supporters et bénévoles." />
        <FeatureCards
          items={[
            { title: "Matchday", text: "Un lieu pour vivre les rencontres et porter les couleurs du club.", icon: Waves },
            { title: "Supporters", text: "Un espace d'accueil pour les familles et les habitants.", icon: Users },
            { title: "Club house", text: "Un endroit de convivialité pour prolonger la vie du club.", icon: Home }
          ]}
        />
      </section>
    </>
  );
}
