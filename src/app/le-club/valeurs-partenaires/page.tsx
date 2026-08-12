import { BadgeEuro, BookOpen, Download, Eye, Handshake, Megaphone } from "lucide-react";

import { ButtonLink } from "@/components/ButtonLink";
import { FeatureCards } from "@/components/FeatureCards";
import { PartnerForm } from "@/components/Forms";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { ConductGrid, ConductRegulation } from "@/components/club/ClubPublicBlocks";
import { images } from "@/lib/images";
import { getPublicPartners, getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/valeurs-partenaires");
export const dynamic = "force-dynamic";

const conductPdfHref = "/le-club/codes-de-conduite/pdf";
const conductPdfDownloadHref = "/le-club/codes-de-conduite/pdf?download=1";

export default async function ValeursPartenairesPage() {
  const [{ codesConduite }, partners] = await Promise.all([getSiteSettings(), getPublicPartners()]);

  return (
    <>
      <MobileScreen eyebrow="Le Club" title="Valeurs et partenaires" actions={[{ href: "/contact", label: "Contact" }]} scrollable>
        <div className="grid gap-3 pb-2">
          {codesConduite.blocks.map((block) => (
            <MobileCard key={block.title}>
              <p className="text-xs font-black uppercase text-[#664d00]">{block.audience}</p>
              <h2 className="mt-1 text-lg font-black uppercase text-[#002f1d]">{block.title}</h2>
            </MobileCard>
          ))}
          <MobileCard>
            <p className="text-xs font-black uppercase text-[#664d00]">Partenaires</p>
            <p className="mt-2 text-sm font-bold text-slate-700">{partners.length} partenaires soutiennent le projet du club.</p>
          </MobileCard>
        </div>
      </MobileScreen>

      <DesktopOnly>
        <PageHero eyebrow="Le Club" description="Les règles qui nous rassemblent et les partenaires qui rendent le projet du club possible." image={images.teamHuddle} title="Valeurs et partenaires" />

        <nav className="border-b border-[#07542f]/10 bg-white px-4 py-4 sm:px-6 lg:px-8" aria-label="Sections valeurs et partenaires">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-3">
            <a className="focus-ring rounded-full bg-[#f7c600] px-4 py-2 text-xs font-black uppercase text-[#001c10]" href="#valeurs">Valeurs et conduite</a>
            <a className="focus-ring rounded-full border border-[#07542f]/20 px-4 py-2 text-xs font-black uppercase text-[#002f1d]" href="#partenaires">Partenaires</a>
          </div>
        </nav>

        <section id="valeurs" className="scroll-mt-[var(--header-h)] mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Codes de bonne conduite" title="Les repères essentiels pour chacun" text="Respect, ponctualité, responsabilité et confiance pour les joueurs, familles, éducateurs et supporters." />
          <div className="mb-8 flex flex-col gap-4 rounded-lg border border-[#07542f]/12 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase text-[#664d00]">Document PDF</p>
              <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Code de bonne conduite complet</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#07542f]/15 px-4 py-3 text-sm font-black uppercase text-[#07542f]" href={conductPdfHref} target="_blank" rel="noopener noreferrer">Lire le PDF <BookOpen size={17} aria-hidden="true" /></a>
              <a className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#f7c600] px-4 py-3 text-sm font-black uppercase text-[#001c10]" download href={conductPdfDownloadHref}>Télécharger <Download size={17} aria-hidden="true" /></a>
            </div>
          </div>
          <ConductGrid blocks={codesConduite.blocks} />
        </section>

        <section className="bg-[#f7f9f5] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionTitle eyebrow="Règlement intérieur" title="Les règles de fonctionnement du club" />
            <ConductRegulation items={codesConduite.regulation} />
          </div>
        </section>

        <section id="partenaires" className="scroll-mt-[var(--header-h)] mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="club-panel rounded-lg p-6 text-white">
              <h2 className="text-3xl font-black uppercase text-[#f7c600]">Devenez partenaire du club</h2>
              <p className="mt-4 text-white/80">Visibilité locale, stade, événements, textile et médias : construisons une offre adaptée.</p>
              <div className="mt-6"><ButtonLink href="#devenir-partenaire">Devenir partenaire</ButtonLink></div>
            </div>
            <div>
              <SectionTitle title="Ils nous font confiance" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {partners.map((partner) => (
                  <div className="official-card flex min-h-24 items-center justify-center rounded-lg bg-white p-6 text-center" key={partner.name}>
                    {partner.logoUrl ? <img src={partner.logoUrl} alt={partner.name} className="mx-auto max-h-16 w-auto object-contain" /> : <span className="text-xl font-black text-[#002f1d]">{partner.name}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Engagement" title="Soutenir le projet du club" />
          <FeatureCards items={[
            { title: "Visibilité", text: "Présence sur le site, les supports et les temps forts du club.", icon: Eye },
            { title: "Territoire", text: "Associer son image à un club populaire et familial.", icon: Handshake },
            { title: "Communication", text: "Valoriser les partenaires dans les contenus et événements.", icon: Megaphone },
            { title: "Impact local", text: "Soutenir la jeunesse, le sport et la vie associative.", icon: BadgeEuro }
          ]} />
        </section>

        <section id="devenir-partenaire" className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="official-card rounded-2xl bg-white p-6 sm:p-8"><PartnerForm /></div>
        </section>
      </DesktopOnly>
    </>
  );
}
