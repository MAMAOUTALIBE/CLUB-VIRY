import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { navItems } from "@/lib/data";
import { images } from "@/lib/images";

export const metadata = {
  title: "Plan du site"
};

const extraLinks = [
  ["/le-club/histoire", "Histoire"],
  ["/le-club/mot-du-president", "Mot du Président"],
  ["/le-club/organigramme", "Organigramme"],
  ["/le-club/stade-henri-longuet", "Stade Henri Longuet"],
  ["/espace-membre", "Espace membre"],
  ["/espace-educateur", "Espace éducateur"],
  ["/admin", "Espace administrateur"]
];

export default function SiteMapPage() {
  return (
    <>
      <PageHero description="Retrouvez toutes les pages principales du site." image={images.stadiumHero} title="Plan du site" />
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2">
          {[...navItems.map((item) => [item.href, item.label]), ...extraLinks].map(([href, label]) => (
            <Link className="focus-ring official-card rounded-lg bg-white p-4 font-black uppercase text-[#002f1d]" href={href} key={href}>
              {label}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
