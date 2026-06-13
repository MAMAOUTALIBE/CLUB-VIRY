import { PageHero } from "@/components/PageHero";
import { PremiumCta } from "@/components/PremiumCta";
import { SectionTitle } from "@/components/SectionTitle";
import { Reveal } from "@/components/Motion";
import { iconByName } from "@/lib/icon-map";
import { images } from "@/lib/images";
import { getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/histoire");
export const revalidate = 300; // ISR : contenu CMS rafraichi toutes les 5 min

export default async function HistoryPage() {
  const { histoire } = await getSiteSettings();
  const timeline = histoire.timeline;
  return (
    <>
      <PageHero description="Un club historique de l'Essonne, porté par des bénévoles, des éducateurs et des familles." image={images.stadiumAerial} title="Notre histoire" />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle eyebrow={histoire.eyebrow} title={histoire.title} text={histoire.intro} />
        <div className="relative mt-12">
          {/* Ligne verticale dorée en dégradé, reliant les noeuds */}
          <span
            aria-hidden="true"
            className="absolute left-7 top-7 h-[calc(100%-3.5rem)] w-[2px] rounded-full bg-gradient-to-b from-[#f7c600] via-[#f7c600]/45 to-transparent"
          />
          <div className="grid gap-7">
            {timeline.map(({ year, title, text, iconName }, index) => {
              const Icon = iconByName(iconName);
              return (
              <Reveal key={`${year}-${index}`} delay={index * 0.08}>
                <article className="group relative flex items-start gap-5 sm:gap-7">
                  {/* Noeud : carré arrondi vert foncé + icône dorée */}
                  <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00351f] to-[#00120b] text-[#f7c600] shadow-[0_12px_28px_rgba(0,31,19,0.4)] ring-4 ring-[#f7c600]/20 transition duration-300 group-hover:-translate-y-0.5 group-hover:ring-[#f7c600]/55">
                    <Icon size={26} strokeWidth={2} aria-hidden="true" />
                  </span>
                  {/* Carte */}
                  <div className="premium-card flex-1 rounded-2xl p-6 sm:p-7">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#f7c600] to-[#ffdb52] px-4 py-1.5 text-sm font-black uppercase tracking-wider text-[#3a2c00] shadow-[0_6px_16px_rgba(247,198,0,0.35)]">
                        {year}
                      </span>
                      <h3 className="text-xl font-black uppercase leading-tight text-[#002f1d] sm:text-2xl">{title}</h3>
                    </div>
                    <p className="mt-3 text-base leading-7 text-slate-700 sm:text-[1.05rem]">{text}</p>
                  </div>
                </article>
              </Reveal>
              );
            })}
          </div>
        </div>
      </section>
      <PremiumCta
        primaryHref="/le-club/stade-henri-longuet"
        primaryLabel="Découvrir le stade"
        secondaryHref="/equipes"
        secondaryLabel="Voir les équipes"
        text="L'histoire du club continue chaque week-end, sur le terrain et autour des familles."
        title="Une histoire vivante, portée par le terrain"
      />
    </>
  );
}
