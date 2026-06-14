import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { EducatorsDirectory } from "@/components/educator/EducatorsDirectory";
import { StaffByTeam } from "@/components/educator/StaffByTeam";
import { images } from "@/lib/images";
import { getPublicEducators } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/encadrement");
export const revalidate = 300; // ISR : contenu CMS rafraichi toutes les 5 min

export default async function EncadrementPage() {
  const educators = await getPublicEducators();

  return (
    <>
      <PageHero
        description="Des éducateurs diplômés et passionnés au service de la formation et du plaisir de jouer."
        image={images.teamHuddle}
        title="Encadrement"
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Nos éducateurs"
          title="L'encadrement sportif du club"
          text="Derrière chaque équipe, des femmes et des hommes engagés. Recherchez un éducateur par son nom ou son équipe, et parcourez l'effectif au fil des flèches."
        />
        {educators.length > 0 ? (
          <EducatorsDirectory educators={educators} />
        ) : (
          <p className="club-panel mt-8 rounded-lg p-8 text-center text-white/80">
            L'encadrement sportif sera présenté ici prochainement.
          </p>
        )}
      </section>

      {educators.some((educator) => educator.teams.length > 0) ? (
        <section className="bg-[#f7f7f5] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Par équipe"
              title="L'encadrement, équipe par équipe"
              text="Qui encadre chaque équipe du club, du staff principal aux adjoints — cliquez pour voir la fiche ou l'équipe."
            />
            <StaffByTeam educators={educators} />
          </div>
        </section>
      ) : null}
    </>
  );
}
