import { Clock, Mail, MapPin, MessageSquare, Phone, Users } from "lucide-react";
import { ContactForm } from "@/components/Forms";
import { FeatureCards } from "@/components/FeatureCards";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/contact");

export default function ContactPage() {
  return (
    <>
      <MobileScreen
        eyebrow="Contact"
        title="Nous écrire"
        scrollable
      >
        <div className="grid gap-3 pb-2 md:grid-cols-[0.75fr_1.25fr]">
          <MobileCard>
            <div className="grid gap-2 text-sm font-bold text-slate-700">
              <p>Stade Henri Longuet · 91170 Viry-Châtillon</p>
              <p>01 69 24 39 50</p>
              <p className="break-words">esvirychatillon91170@gmail.com</p>
            </div>
          </MobileCard>
          <ContactForm />
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero description="Nous sommes à votre écoute." image={images.stadiumAerial} title="Contactez-nous" />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 3xl:grid-cols-[0.72fr_minmax(0,0.95fr)] 3xl:justify-center">
        <address className="not-italic">
          <div className="club-panel rounded-lg p-6 text-white">
            <h2 className="text-2xl font-black uppercase text-[#f7c600]">Coordonnées</h2>
            <div className="mt-6 space-y-5">
              <p className="flex gap-3"><MapPin className="shrink-0 text-[#f7c600]" /> Stade Henri Longuet, Avenue de l'Armée Leclerc, 91170 Viry-Châtillon</p>
              <p className="flex gap-3"><Phone className="shrink-0 text-[#f7c600]" /> 01 69 24 39 50</p>
              <p className="flex gap-3"><Mail className="shrink-0 text-[#f7c600]" /> esvirychatillon91170@gmail.com</p>
            </div>
          </div>
          <div className="official-card mt-5 overflow-hidden rounded-lg bg-white p-2">
            <iframe
              className="h-72 w-full rounded"
              title="Localisation du Stade Henri Longuet à Viry-Châtillon"
              src="https://www.google.com/maps?q=Stade%20Henri%20Longuet%2C%20Viry-Ch%C3%A2tillon&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </address>
        <ContactForm />
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Contact utile" title="Trouver rapidement le bon interlocuteur" text="Familles, joueurs, partenaires, bénévoles : trouvez rapidement le bon interlocuteur." />
        <FeatureCards
          items={[
            { title: "Familles", text: "Questions inscriptions, licences, documents et catégories.", icon: Users },
            { title: "Partenaires", text: "Demandes de sponsoring, visibilité et collaboration.", icon: MessageSquare },
            { title: "Stade", text: "Accès, localisation, horaires et informations pratiques.", icon: MapPin },
            { title: "Horaires", text: "Informer clairement sur les disponibilités du club.", icon: Clock }
          ]}
        />
      </section>
      </DesktopOnly>
    </>
  );
}
