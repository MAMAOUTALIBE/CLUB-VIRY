import { Stagger, StaggerItem } from "@/components/Motion";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { news } from "@/lib/data";
import { images } from "@/lib/images";

export const metadata = {
  title: "Actualités"
};

export default function NewsPage() {
  const leadNews = news[0];
  const otherNews = news.slice(1);

  return (
    <>
      <PageHero description="Toute la vie du club : résultats, stages, événements, informations pratiques." image={images.teamHuddle} title="Actualités" />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle title="Dernières actualités" text="L'actualité forte du moment, puis toutes les nouvelles du club." />
        <article className="premium-card mb-6 grid overflow-hidden rounded-lg bg-white lg:grid-cols-[1.1fr_0.9fr]">
          <img alt="" className="h-72 w-full object-cover lg:h-full" src={leadNews.image} />
          <div className="p-6">
            <p className="text-xs font-black uppercase text-[#f7c600]">À la une · {leadNews.date}</p>
            <h2 className="mt-3 text-4xl font-black uppercase text-[#002f1d]">{leadNews.title}</h2>
            <p className="mt-4 leading-7 text-slate-700">{leadNews.excerpt}</p>
          </div>
        </article>
        <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {otherNews.map((item) => (
            <StaggerItem className="premium-card overflow-hidden rounded-lg bg-white" key={item.title}>
              <img alt="" className="h-48 w-full object-cover" src={item.image} />
              <div className="p-5">
                <p className="text-xs font-black uppercase text-[#f7c600]">{item.category} · {item.date}</p>
                <h2 className="mt-2 text-xl font-black uppercase text-[#002f1d]">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-700">{item.excerpt}</p>
                <p className="mt-4 text-xs font-black uppercase text-slate-400">Article à venir</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
