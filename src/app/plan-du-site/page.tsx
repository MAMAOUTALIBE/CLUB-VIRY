import Link from "next/link";
import { DesktopOnly, MobileScreen } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/plan-du-site");

// Plan du site reflétant la navigation réelle (mêmes regroupements que le menu).
// Les zones privées (/admin, espace éducateur) ne sont volontairement pas listées.
const SECTIONS: Array<{ title: string; links: Array<[string, string]> }> = [
  {
    title: "Le Club",
    links: [
      ["/le-club", "Le Club"],
      ["/le-club/histoire", "Histoire"],
      ["/le-club/organigramme", "Organisation du club"],
      ["/le-club/infrastructures", "Infrastructures du club"],
      ["/le-club/valeurs-partenaires", "Valeurs et partenaires"]
    ]
  },
  {
    title: "ES Viry Academy",
    links: [
      ["/academy", "ES Viry Academy"],
      ["/academy#entraineurs", "Entraîneurs"],
      ["/academy#encadrement", "Encadrement sportif"],
      ["/academy#ecole-de-foot", "École de Foot"],
      ["/academy#football-a-11", "Football à 11"],
      ["/academy#stages", "Stages"]
    ]
  },
  {
    title: "Sportif",
    links: [
      ["/equipes", "Équipes"],
      ["/actualites", "Actualités"],
      ["/calendrier", "Calendrier"],
      ["/resultats", "Résultats"],
      ["/medias", "Médias / Galerie"]
    ]
  },
  {
    title: "Boutique",
    links: [
      ["/boutique", "Boutique officielle"],
      ["/boutique/conditions-generales", "Conditions générales"],
      ["/boutique/livraison-retour", "Livraison & retour"]
    ]
  },
  {
    title: "Nous rejoindre",
    links: [
      ["/inscriptions", "Inscriptions"],
      ["/detections-recrutement", "Détections / Recrutement"],
      ["/partenaires", "Partenaires"],
      ["/contact", "Contact"]
    ]
  },
  {
    title: "Mon espace",
    links: [["/espace-membre", "Espace membre / famille"]]
  },
  {
    title: "Informations légales",
    links: [
      ["/mentions-legales", "Mentions légales"],
      ["/politique-confidentialite", "Politique de confidentialité"]
    ]
  }
];

export default function SiteMapPage() {
  return (
    <>
      <MobileScreen eyebrow="Navigation" title="Plan du site" scrollable>
        <div className="grid gap-5 pb-2">
          {SECTIONS.map((section) => (
            <nav aria-label={section.title} className="rounded-lg border border-[#07542f]/12 bg-white p-4 shadow-sm" key={section.title}>
              <h2 className="text-sm font-black uppercase text-[#002f1d]">{section.title}</h2>
              <ul className="mt-3 grid gap-2">
                {section.links.map(([href, label]) => (
                  <li key={href}>
                    <Link className="focus-ring font-bold text-slate-700" href={href}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </MobileScreen>
      <DesktopOnly>
        <PageHero description="Retrouvez toutes les pages du site officiel de l'ES Viry-Châtillon Football." image={images.stadiumHero} title="Plan du site" />
        <section className="mx-auto max-w-5xl px-4 pb-10 md:py-14 sm:px-6 lg:px-8">
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((section) => (
              <nav aria-label={section.title} key={section.title}>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#07542f]">{section.title}</h2>
                <span aria-hidden="true" className="mt-2 block h-[2px] w-8 rounded-full bg-[#f7c600]" />
                <ul className="mt-4 grid gap-2.5">
                  {section.links.map(([href, label]) => (
                    <li key={href}>
                      <Link className="focus-ring font-bold text-[#002f1d] transition hover:text-[#07542f] hover:underline" href={href}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </section>
      </DesktopOnly>
    </>
  );
}
