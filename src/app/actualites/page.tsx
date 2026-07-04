import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { LiveMatch } from "@/components/LiveMatch";
import { LiveVideo } from "@/components/LiveVideo";
import { DesktopOnly, MobileLinkCard, MobileScreen, MobileScrollableList } from "@/components/MobilePage";
import { Stagger, StaggerItem } from "@/components/Motion";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { images } from "@/lib/images";
import { getPublicNews } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/actualites");
export const revalidate = 300; // ISR : contenu CMS rafraichi toutes les 5 min

export default async function NewsPage() {
  const allNews = await getPublicNews(13);
  const leadNews = allNews[0];
  const otherNews = allNews.slice(1);
  const mobileNews = allNews.slice(1, 6);

  return (
    <>
      <MobileScreen
        eyebrow="Actualités"
        title="Vie du club"
        actions={[{ href: "/calendrier", label: "Calendrier", variant: "secondary" }]}
      >
        <div className="flex h-full min-h-0 flex-col gap-3">
          {leadNews ? (
            <MobileLinkCard href={`/actualites/${leadNews.slug}`}>
              <p className="text-xs font-black uppercase text-[#664d00]">À la une · {leadNews.date}</p>
              <h2 className="mt-1 text-lg font-black uppercase leading-tight text-[#002f1d]">{leadNews.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-slate-700">{leadNews.excerpt}</p>
            </MobileLinkCard>
          ) : null}
          <MobileScrollableList>
            {mobileNews.map((item) => (
              <MobileLinkCard href={`/actualites/${item.slug}`} key={item.slug}>
                <p className="text-xs font-black uppercase text-[#664d00]">{item.category} · {item.date}</p>
                <h2 className="mt-1 text-base font-black uppercase leading-tight text-[#002f1d]">{item.title}</h2>
              </MobileLinkCard>
            ))}
          </MobileScrollableList>
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero description="Toute la vie du club : résultats, stages, événements, informations pratiques." image={images.teamHuddle} title="Actualités" />
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Match en direct" title="Suivez les Jaune et Vert" text="Regardez le match en vidéo et suivez le score, le chrono et les faits de match en temps réel." />
        <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr] 3xl:grid-cols-[1.65fr_1fr]">
          <LiveVideo />
          <LiveMatch />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle title="Dernières actualités" text="L'actualité forte du moment, puis toutes les nouvelles du club." />
        <Link
          className="focus-ring premium-card mb-6 grid overflow-hidden rounded-lg bg-white lg:grid-cols-[1.1fr_0.9fr]"
          href={`/actualites/${leadNews.slug}`}
        >
          <div className="relative h-72 w-full lg:h-full">
            <Image src={leadNews.image} alt={leadNews.title} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
          </div>
          <div className="p-6">
            <p className="text-xs font-black uppercase text-[#664d00]">
              À la une · <time dateTime={leadNews.isoDate}>{leadNews.date}</time>
            </p>
            <h2 className="mt-3 text-4xl font-black uppercase text-[#002f1d]">{leadNews.title}</h2>
            <p className="mt-4 leading-7 text-slate-700">{leadNews.excerpt}</p>
            <p className="mt-4 text-xs font-black uppercase text-[#002f1d]">Lire l'article →</p>
          </div>
        </Link>
        <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
          {otherNews.map((item) => (
            <StaggerItem key={item.title}>
              <Link className="focus-ring premium-card block h-full overflow-hidden rounded-lg bg-white" href={`/actualites/${item.slug}`}>
                <div className="relative h-48 w-full">
                  <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                </div>
                <div className="p-5">
                  <p className="text-xs font-black uppercase text-[#664d00]">
                    {item.category} · <time dateTime={item.isoDate}>{item.date}</time>
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

      {/* Bandeau contact + QR */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl border border-[#002f1d]/10 bg-white shadow-[0_20px_55px_rgba(0,31,19,0.1)] lg:grid-cols-[minmax(0,auto)_1fr]">
          <div className="club-shell flex items-center gap-4 p-5 text-white sm:p-6">
            <img src="/qr-club.png" alt="QR code — suivez l'ES Viry-Châtillon" width={300} height={300} className="h-24 w-24 shrink-0 rounded-lg bg-white p-1.5 sm:h-28 sm:w-28" />
            <div>
              <p className="inline-flex items-center gap-2 text-lg font-black uppercase">
                <Phone className="text-[#f7c600]" size={20} aria-hidden="true" />
                Scannez-moi
              </p>
              <p className="mt-1 max-w-[12rem] text-sm leading-5 text-white/70">Suivez le club en un clic !</p>
              <span className="mt-3 inline-block h-1 w-12 rounded-full bg-[#f7c600]" />
            </div>
          </div>
          <div className="grid gap-5 p-5 sm:grid-cols-3 sm:gap-4 sm:p-6">
            <a className="focus-ring group flex items-start gap-3" href="tel:+33629670433">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#002f1d] text-[#f7c600]">
                <Phone size={20} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[11px] font-black uppercase tracking-wide text-[#664d00]">Téléphone</span>
                <span className="block text-sm font-bold text-[#002f1d] transition group-hover:text-[#664d00]">06 29 67 04 33<br />01 69 96 67 00</span>
              </span>
            </a>
            <div className="flex items-start gap-3 sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#002f1d] text-[#f7c600]">
                <MapPin size={20} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[11px] font-black uppercase tracking-wide text-[#664d00]">Adresse du club</span>
                <span className="block text-sm font-bold text-[#002f1d]">Stade Henri Longuet<br />91170 Viry-Châtillon</span>
              </span>
            </div>
            <a className="focus-ring group flex items-start gap-3 sm:border-l sm:border-slate-200 sm:pl-4" href="mailto:esvirychatillon91170@gmail.com">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#002f1d] text-[#f7c600]">
                <Mail size={20} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-black uppercase tracking-wide text-[#664d00]">Email</span>
                <span className="block break-words text-sm font-bold text-[#002f1d] transition group-hover:text-[#664d00]">esvirychatillon91170@gmail.com</span>
              </span>
            </a>
          </div>
        </div>
      </section>
      </DesktopOnly>
    </>
  );
}
