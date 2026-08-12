import Image from "next/image";
import { Home, MapPin, Users, Waves } from "lucide-react";

import { FeatureCards } from "@/components/FeatureCards";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { InstallationCards } from "@/components/club/ClubPublicBlocks";
import { getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/infrastructures");
export const dynamic = "force-dynamic";

export default async function InfrastructuresPage() {
  const { installations, stade } = await getSiteSettings();
  const mapsSrc = `https://www.google.com/maps?q=${encodeURIComponent(stade.mapsQuery || stade.address)}&output=embed`;

  return (
    <>
      <MobileScreen eyebrow="Le Club" title="Infrastructures du club" actions={[{ href: "/contact", label: "Contact", variant: "secondary" }]} scrollable>
        <div className="grid gap-3 pb-2">
          <MobileCard>
            <p className="text-xs font-black uppercase text-[#664d00]">Stade Henri Longuet</p>
            <h2 className="mt-1 text-lg font-black uppercase text-[#002f1d]">{stade.address}</h2>
          </MobileCard>
          {installations.map((installation) => (
            <MobileCard key={installation.name}>
              <p className="text-xs font-black uppercase text-[#664d00]">{installation.type}</p>
              <h2 className="mt-1 text-lg font-black uppercase text-[#002f1d]">{installation.name}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-700">{installation.address}</p>
            </MobileCard>
          ))}
        </div>
      </MobileScreen>

      <DesktopOnly>
        <PageHero eyebrow="Le Club" description="Le stade Henri Longuet, les terrains et tous les espaces qui accueillent la vie sportive et associative du club." image="/images/installations/stade-henri-longuet.png" title="Infrastructures du club" />

        <nav className="border-b border-[#07542f]/10 bg-white px-4 py-4 sm:px-6 lg:px-8" aria-label="Sections des infrastructures">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-3">
            <a className="focus-ring rounded-full bg-[#f7c600] px-4 py-2 text-xs font-black uppercase text-[#001c10]" href="#installations">Toutes les installations</a>
            <a className="focus-ring rounded-full border border-[#07542f]/20 px-4 py-2 text-xs font-black uppercase text-[#002f1d]" href="#stade-henri-longuet">Stade Henri Longuet</a>
          </div>
        </nav>

        <section id="installations" className="scroll-mt-[var(--header-h)] mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Lieux du club" title="Les espaces de pratique et d'accueil" text="Terrains, club-house, lieux de rendez-vous et informations pratiques réunis sur une seule page." />
          <InstallationCards installations={installations} />
        </section>

        <section id="stade-henri-longuet" className="scroll-mt-[var(--header-h)] bg-[#f7f8f4] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
            <div>
              <SectionTitle eyebrow="Notre maison" title="Stade Henri Longuet" text="Terrains, vestiaires, club-house et tribunes pour accueillir licenciés, familles et visiteurs." />
              <div className="grid gap-4 sm:grid-cols-2">
                {stade.infrastructures.map((item) => (
                  <div className="official-card rounded-lg bg-white p-5 font-black uppercase text-[#002f1d]" key={item}>{item}</div>
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
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Galerie" title="Le stade en images" text="Tribunes, piste et pelouse du Parc des sports Henri Longuet." />
          <div className="grid gap-4 sm:grid-cols-2">
            {stade.gallery.map((photo) => (
              <figure className="official-card overflow-hidden rounded-lg bg-white" key={photo.src}>
                <div className="relative aspect-[4/3] w-full"><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" /></div>
                <figcaption className="p-4 text-sm font-black uppercase text-[#002f1d]">{photo.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Lieu de vie" title="Plus qu'un terrain, une maison" />
          <FeatureCards items={[
            { title: "Matchday", text: "Un lieu pour vivre les rencontres et porter les couleurs du club.", icon: Waves },
            { title: "Supporters", text: "Un espace d'accueil pour les familles et les habitants.", icon: Users },
            { title: "Club-house", text: "Un endroit de convivialité pour prolonger la vie du club.", icon: Home }
          ]} />
        </section>
      </DesktopOnly>
    </>
  );
}
