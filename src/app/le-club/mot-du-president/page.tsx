import { Quote } from "lucide-react";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { PremiumCta } from "@/components/PremiumCta";
import { PageHero } from "@/components/PageHero";
import { getSiteSettings } from "@/lib/public-content";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/mot-du-president");
export const revalidate = 300; // ISR : contenu CMS rafraichi toutes les 5 min

export default async function PresidentPage() {
  const { president } = await getSiteSettings();
  const signature = president.name?.trim() || "Le Président";
  const paragraphs = president.message?.trim()
    ? president.message.trim().split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean)
    : [
        "À l'ES Viry-Châtillon, nous croyons en la jeunesse, au travail, à l'éducation et à l'esprit d'équipe.",
        "Notre ambition est de continuer à former des joueurs, mais aussi des citoyens, et de transmettre les valeurs qui font notre force.",
        "Merci à tous nos éducateurs, nos bénévoles, nos partenaires et nos supporters. Ensemble, continuons à faire rayonner les couleurs de Viry."
      ];

  return (
    <>
      <MobileScreen
        eyebrow="Le Club"
        title="Mot du Président"
        actions={[{ href: "/contact", label: "Contact" }]}
        scrollable
      >
        <MobileCard>
          <p className="text-base font-black leading-6 text-[#002f1d]">L'avenir s'écrit ensemble</p>
          <p className="mt-4 text-sm font-semibold leading-6 text-slate-700">{paragraphs[0]}</p>
          <p className="mt-5 text-right text-sm font-black uppercase text-[#002f1d]">{signature}</p>
        </MobileCard>
      </MobileScreen>
      <DesktopOnly>
      <PageHero description="Un message pour les joueurs, les familles, les éducateurs, les bénévoles et les partenaires." image={images.supporters} title="Mot du Président" />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:px-8">
        <div className="club-panel rounded-lg p-8 text-center text-white">
          <Quote className="mx-auto mb-6 text-[#f7c600]" size={42} aria-hidden="true" />
          <img
            className="mx-auto h-[168px] w-[168px] rounded-full object-contain"
            src={president.photoUrl?.trim() || "/club-logo.svg"}
            alt={president.photoUrl?.trim() ? signature : "ES Viry-Châtillon Football"}
            width={168}
            height={168}
          />
          <p className="mt-6 text-3xl font-black italic text-[#f7c600]">L'avenir s'écrit ensemble</p>
          <p className="mt-3 text-sm uppercase tracking-wide text-white/70">Un club, une ville, une responsabilité</p>
        </div>
        <article className="official-card rounded-lg bg-white p-8 leading-8">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className={index === 0 ? undefined : "mt-4"}>
              {paragraph}
            </p>
          ))}
          <p className="mt-8 text-right font-black text-[#002f1d]">{signature}</p>
        </article>
      </section>
      <PremiumCta
        primaryHref="/contact"
        primaryLabel="Contacter le club"
        secondaryHref="/partenaires"
        secondaryLabel="Soutenir le projet"
        text="La crédibilité d'un club se construit avec ses éducateurs, ses bénévoles, ses familles et ses partenaires."
        title="Faisons rayonner Viry ensemble"
      />
      </DesktopOnly>
    </>
  );
}
