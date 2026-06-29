import { BookOpen, Download } from "lucide-react";

import { ButtonLink } from "@/components/ButtonLink";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { ConductGrid, ConductRegulation } from "@/components/club/ClubPublicBlocks";
import { conductBlocks, regulationItems } from "@/lib/club-pages-data";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/codes-de-conduite");

const conductPdfHref = "/le-club/codes-de-conduite/pdf";
const conductPdfDownloadHref = "/le-club/codes-de-conduite/pdf?download=1";

export default function CodesDeConduitePage() {
  return (
    <>
      <MobileScreen
        eyebrow="Le Club"
        title="Codes de conduite"
        description="Les règles essentielles pour joueurs, parents, supporters et éducateurs."
        actions={[{ href: "/contact", label: "Signaler une question", variant: "secondary" }]}
        scrollable
      >
        <div className="grid gap-3 pb-2 md:grid-cols-2">
          <div className="grid grid-cols-2 gap-2 md:col-span-2">
            <a className="focus-ring rounded-lg bg-[#f7c600] p-3 text-sm font-black uppercase text-[#001c10]" href={conductPdfDownloadHref} download>
              Télécharger PDF
            </a>
            <a className="focus-ring rounded-lg border border-[#07542f]/15 bg-white p-3 text-sm font-black uppercase text-[#07542f]" href={conductPdfHref} target="_blank" rel="noopener noreferrer">
              Lire le PDF
            </a>
          </div>
          {conductBlocks.map((block) => (
            <MobileCard key={block.title}>
              <p className="text-xs font-black uppercase text-[#664d00]">{block.audience}</p>
              <h2 className="mt-1 text-lg font-black uppercase text-[#002f1d]">{block.title}</h2>
              <ul className="mt-2 grid gap-1.5">
                {block.essentials.slice(0, 3).map((rule) => (
                  <li className="text-sm font-semibold leading-5 text-slate-700" key={rule}>
                    {rule}
                  </li>
                ))}
              </ul>
            </MobileCard>
          ))}
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero
        eyebrow="Le Club"
        description="Un cadre partagé pour les joueurs, parents, éducateurs et supporters : respect, ponctualité, responsabilité et confiance."
        image={images.teamHuddle}
        title="Codes de conduite"
      >
        <ButtonLink href="/contact">Signaler une question au club</ButtonLink>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Codes de bonne conduite"
          title="Les repères essentiels pour chacun"
          text="Chaque rôle dispose d'une lecture courte avec les règles principales visibles directement. Les détails restent disponibles sans alourdir la page."
        />
        <div className="mb-8 flex flex-col gap-4 rounded-lg border border-[#07542f]/12 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-black uppercase text-[#664d00]">Document PDF</p>
            <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Code de bonne conduite complet</h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-700">
              Le document complet est disponible en PDF pour lecture, impression ou téléchargement.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#07542f]/15 bg-white px-4 py-3 text-sm font-black uppercase text-[#07542f] transition hover:border-[#f7c600]"
              href={conductPdfHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              Lire le PDF
              <BookOpen size={17} aria-hidden="true" />
            </a>
            <a
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#f7c600] px-4 py-3 text-sm font-black uppercase text-[#001c10] shadow-[0_10px_24px_rgba(247,198,0,0.22)] transition hover:bg-[#002f1d] hover:text-white"
              download
              href={conductPdfDownloadHref}
            >
              Télécharger
              <Download size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
        <ConductGrid blocks={conductBlocks} />
      </section>

      <section className="bg-[#f7f9f5] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Règlement intérieur"
            title="Les règles de fonctionnement du club"
            text="Ce règlement complète les codes de conduite et fixe les conditions d'adhésion, de présence, de responsabilité et de discipline."
          />
          <ConductRegulation items={regulationItems} />
        </div>
      </section>
      </DesktopOnly>
    </>
  );
}
