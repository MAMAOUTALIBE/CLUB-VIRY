import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { EducatorCard } from "@/components/educator/EducatorCard";
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
          text="Derrière chaque équipe, des femmes et des hommes engagés. Découvrez celles et ceux qui font progresser nos licenciés, leurs équipes et leur activité au quotidien."
        />
        {educators.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {educators.map((educator) => (
              <EducatorCard educator={educator} key={educator.id} />
            ))}
          </div>
        ) : (
          <p className="club-panel rounded-lg p-8 text-center text-white/80">
            L'encadrement sportif sera présenté ici prochainement.
          </p>
        )}
      </section>
    </>
  );
}
