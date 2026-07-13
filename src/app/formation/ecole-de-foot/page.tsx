import { ButtonLink } from "@/components/ButtonLink";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { StaffDirectory, TrainingSlots } from "@/components/club/ClubPublicBlocks";
import { images } from "@/lib/images";
import { getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/formation/ecole-de-foot");
export const dynamic = "force-dynamic"; // CMS : éducateurs & créneaux à jour immédiatement

export default async function EcoleDeFootPage() {
  const settings = await getSiteSettings();
  const ecoleFootEducators = settings.formationEcoleEducateurs;
  const trainingSlots = settings.formationCreneaux;
  return (
    <>
      <MobileScreen
        eyebrow="Formation"
        title="École de foot"
        actions={[{ href: "/inscriptions", label: "Inscription" }]}
        scrollable
      >
        <div className="grid gap-3 pb-2">
          <MobileCard>
            <p className="text-xs font-black uppercase text-[#664d00]">Éducateurs</p>
            <div className="mt-3 grid gap-2">
              {ecoleFootEducators.slice(0, 5).map((person) => (
                <p className="text-sm font-bold text-slate-700" key={person.name}>
                  <span className="font-black text-[#002f1d]">{person.category}</span> · {person.name}
                </p>
              ))}
            </div>
          </MobileCard>
          <MobileCard>
            <p className="text-xs font-black uppercase text-[#664d00]">Créneaux</p>
            <div className="mt-3 grid gap-2">
              {trainingSlots.slice(0, 4).map((slot) => (
                <p className="text-sm font-bold text-slate-700" key={slot.category}>
                  <span className="font-black text-[#002f1d]">{slot.category}</span> · {slot.time}
                </p>
              ))}
            </div>
          </MobileCard>
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero
        eyebrow="Formation"
        description="Découvrez l'organisation de l'école de foot, les éducateurs référents et les repères de progression des catégories U6 à U13."
        image={images.training}
        title="Éducateurs de l'école de foot"
      >
        <ButtonLink href="/inscriptions">Rejoindre l'école de foot</ButtonLink>
      </PageHero>

      <StaffDirectory
        intro="Les contacts affichés sont volontairement centralisés via le secrétariat : aucune coordonnée personnelle n'est publiée sur le site."
        people={ecoleFootEducators}
      />

      <section className="bg-[#f7f8f4] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Repères familles" title="Créneaux et lieux indicatifs" text="Ces informations servent de base publique. Les convocations et changements de dernière minute restent gérés dans le CRM." />
          <TrainingSlots slots={trainingSlots} />
        </div>
      </section>
      </DesktopOnly>
    </>
  );
}
