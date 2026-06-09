import Link from "next/link";
import { LiveMatch } from "@/components/LiveMatch";
import { LiveVideo } from "@/components/LiveVideo";
import { Stagger, StaggerItem } from "@/components/Motion";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { news } from "@/lib/data";
import { images } from "@/lib/images";
import { slugify } from "@/lib/slug";

export const metadata = {
  title: "Actualités"
};

export default function NewsPage() {
  const leadNews = news[0];
  const otherNews = news.slice(1);

  return (
    <>
      <PageHero description="Toute la vie du club : résultats, stages, événements, informations pratiques." image={images.teamHuddle} title="Actualités" />
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Match en direct" title="Suivez les Jaune et Vert" text="Regardez le match en vidéo et suivez le score, le chrono et les faits de match en temps réel." />
        <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
          <LiveVideo />
          <LiveMatch />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle title="Dernières actualités" text="L'actualité forte du moment, puis toutes les nouvelles du club." />
        <Link
          className="focus-ring premium-card mb-6 grid overflow-hidden rounded-lg bg-white lg:grid-cols-[1.1fr_0.9fr]"
          href={`/actualites/${slugify(leadNews.title)}`}
        >
          <img alt={leadNews.title} className="h-72 w-full object-cover lg:h-full" loading="lazy" src={leadNews.image} />
          <div className="p-6">
            <p className="text-xs font-black uppercase text-[#8a6d00]">
              À la une · <time>{leadNews.date}</time>
            </p>
            <h2 className="mt-3 text-4xl font-black uppercase text-[#002f1d]">{leadNews.title}</h2>
            <p className="mt-4 leading-7 text-slate-700">{leadNews.excerpt}</p>
            <p className="mt-4 text-xs font-black uppercase text-[#002f1d]">Lire l'article →</p>
          </div>
        </Link>
        <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {otherNews.map((item) => (
            <StaggerItem key={item.title}>
              <Link className="focus-ring premium-card block h-full overflow-hidden rounded-lg bg-white" href={`/actualites/${slugify(item.title)}`}>
                <img alt={item.title} className="h-48 w-full object-cover" loading="lazy" src={item.image} />
                <div className="p-5">
                  <p className="text-xs font-black uppercase text-[#8a6d00]">
                    {item.category} · <time>{item.date}</time>
                  </p>
                  <h2 className="mt-2 text-xl font-black uppercase text-[#002f1d]">{item.title}</h2>
                  <p className="mt-2 text-sm text-slate-700">{item.excerpt}</p>
                  <p className="mt-4 text-xs font-black uppercase text-[#002f1d]">Lire l'article →</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
