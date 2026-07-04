import { Home, MapPin, Users, Waves } from "lucide-react";
import Image from "next/image";
import { FeatureCards } from "@/components/FeatureCards";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { images } from "@/lib/images";
import { getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/stade-henri-longuet");
export const revalidate = 300; // ISR : contenu CMS rafraichi toutes les 5 min

export default async function StadiumPage() {
  const { stade } = await getSiteSettings();
  const mapsSrc = `https://www.google.com/maps?q=${encodeURIComponent(stade.mapsQuery || stade.address)}&output=embed`;
  return (
    <>
      <MobileScreen
        eyebrow="Le Club"
        title="Stade Henri Longuet"
        actions={[{ href: "/contact", label: "Contact", variant: "secondary" }]}
        scrollable
      >
        <div className="grid gap-3 pb-2">
          <MobileCard>
            <p className="text-xs font-black uppercase text-[#664d00]">Adresse</p>
            <h2 className="mt-1 text-lg font-black uppercase leading-tight text-[#002f1d]">{stade.address}</h2>
          </MobileCard>
          <MobileCard>
            <p className="text-xs font-black uppercase text-[#664d00]">Infrastructures</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {stade.infrastructures.slice(0, 6).map((item) => (
                <span className="rounded-md bg-[#07542f]/10 px-2.5 py-1 text-xs font-black uppercase text-[#002f1d]" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </MobileCard>
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero
        description="Notre maison, notre fierté. Un lieu de vie sportive au coeur de Viry-Châtillon."
        image={images.stadiumAerial}
        title="Stade Henri Longuet"
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div>
          <SectionTitle title="Infrastructures" text="Terrains, vestiaires, club house et tribunes pour accueillir licenciés, familles et visiteurs." />
          <div className="grid gap-4 sm:grid-cols-2">
            {stade.infrastructures.map((item) => (
              <div className="official-card rounded-lg bg-white p-5 font-black uppercase text-[#002f1d]" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="club-panel rounded-lg p-6 text-white">
          <MapPin className="text-[#f7c600]" size={38} aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black uppercase">Adresse</h2>
          <p className="mt-3">{stade.address}</p>
          <div className="mt-6 overflow-hidden rounded-lg">
            <iframe className="h-64 w-full rounded-lg" title="Localisation du Stade Henri Longuet à Viry-Châtillon" src={mapsSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Galerie" title="Le stade en images" text="Tribunes, piste et pelouse du Parc des sports Henri Longuet, au bord du lac de Viry-Châtillon." />
        <div className="grid gap-4 sm:grid-cols-2">
          {stade.gallery.map((photo) => (
            <figure className="official-card overflow-hidden rounded-lg bg-white" key={photo.src}>
              <div className="relative aspect-[4/3] w-full">
                {/* Photos : chemin local /stade/*.jpg (défaut) ou URL Supabase Storage / Unsplash (hôtes autorisés dans next.config + CSP). */}
                <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
              </div>
              <figcaption className="p-4 text-sm font-black uppercase text-[#002f1d]">{photo.caption}</figcaption>
            </figure>
          ))}
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
      </DesktopOnly>
    </>
  );
}
