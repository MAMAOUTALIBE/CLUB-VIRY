import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, Camera, Link as LinkIcon, Mail, MapPin, ShieldCheck, Users } from "lucide-react";

import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { images } from "@/lib/images";
import { buildBreadcrumb, jsonLdScript } from "@/lib/jsonld";
import { getClubOfficialBySlug, getClubOfficials, type DisplayOfficial } from "@/lib/public-content";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;
export const dynamic = "force-dynamic";

function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const value = (parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "");
  return value.toUpperCase() || "?";
}

function profileHref(official: DisplayOfficial): string {
  return `/le-club/organigramme/${official.slug}`;
}

function Avatar({ official }: { official: DisplayOfficial }) {
  if (official.photo) {
    return <img src={official.photo} alt={official.name} className="h-full w-full object-cover object-center" />;
  }

  return (
    <div className="stadium-grid flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_20%,rgba(247,198,0,0.18),transparent_38%),linear-gradient(145deg,#001c10,#07542f)] px-5 text-center">
      <span className="flex h-32 w-32 items-center justify-center rounded-full bg-[#001c10]/75 text-4xl font-black uppercase text-[#f7c600] ring-4 ring-[#f7c600]" aria-hidden="true">
        {monogram(official.name)}
      </span>
      <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#f7c600]/45 bg-[#001c10]/55 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#f7c600]">
        <Camera size={13} aria-hidden="true" />
        Photo à ajouter
      </span>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const official = await getClubOfficialBySlug(slug);

  if (!official) {
    return { title: "Responsable du club" };
  }

  return {
    title: `${official.name} — ${official.position}`,
    description: official.bio.slice(0, 160),
    alternates: { canonical: profileHref(official) },
    openGraph: {
      title: `${official.name} — ${official.position}`,
      description: official.bio,
      type: "profile",
      ...(official.photo ? { images: [official.photo] } : {})
    }
  };
}

export default async function OfficialProfilePage({ params }: Props) {
  const { slug } = await params;
  const [official, officials] = await Promise.all([getClubOfficialBySlug(slug), getClubOfficials()]);

  if (!official) {
    notFound();
  }

  const related = [...officials.bureau, ...officials.dirigeants]
    .filter((item) => item.id !== official.id && (item.department === official.department || item.category === official.category))
    .slice(0, 3);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: official.name,
    jobTitle: official.position,
    worksFor: { "@type": "SportsOrganization", name: "ES Viry-Châtillon Football" },
    ...(official.photo ? { image: official.photo } : {}),
    description: official.bio
  };

  const breadcrumbJsonLd = buildBreadcrumb([
    { name: "Accueil", path: "/" },
    { name: "Le Club", path: "/le-club" },
    { name: "Organigramme", path: "/le-club/organigramme" },
    { name: official.name }
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(personJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd) }} />
      <MobileScreen
        eyebrow={official.department}
        title={official.name}
        actions={[
          { href: official.contactHref, label: official.contactLabel },
          { href: "/le-club/organigramme", label: "Retour", variant: "secondary" }
        ]}
        scrollable
      >
        <div className="grid gap-3 pb-2">
          <MobileCard>
            <p className="text-xs font-black uppercase text-[#664d00]">Rôle</p>
            <h2 className="mt-1 text-lg font-black uppercase text-[#002f1d]">{official.position}</h2>
          </MobileCard>
          <MobileCard>
            <p className="text-xs font-black uppercase text-[#664d00]">Missions</p>
            <div className="mt-3 grid gap-2">
              {official.missions.slice(0, 4).map((mission) => (
                <p className="text-sm font-semibold leading-5 text-slate-700" key={mission}>
                  {mission}
                </p>
              ))}
            </div>
          </MobileCard>
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero eyebrow="Profil responsable" description={`${official.position} — ${official.department}`} image={images.training} title={official.name}>
        <Link href="/le-club/organigramme" className="focus-ring inline-flex items-center gap-2 rounded-full bg-[#f7c600] px-5 py-3 text-sm font-black uppercase text-[#001c10] shadow-lg">
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à l'organigramme
        </Link>
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <aside className="space-y-5">
          <article className="official-card overflow-hidden rounded-lg bg-white text-center">
            <div className="relative h-[360px] bg-[#002f1d]">
              <Avatar official={official} />
              <span className="absolute left-4 top-4 rounded-full bg-[#f7c600] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#001c10] shadow">
                Photo officielle
              </span>
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-black uppercase text-[#002f1d]">{official.name}</h1>
              <p className="mt-2 text-sm font-black uppercase tracking-wide text-[#07542f]">{official.position}</p>
              <p className="mt-3 inline-flex rounded-full bg-[#07542f]/10 px-3 py-1 text-xs font-black uppercase text-[#07542f]">{official.department}</p>
            </div>
          </article>

          <article className="official-card rounded-lg bg-white p-6">
            <h2 className="text-lg font-black uppercase text-[#002f1d]">Contact public</h2>
            <p className="mt-3 flex gap-2 text-sm font-semibold text-slate-700">
              <CalendarDays size={17} className="mt-0.5 shrink-0 text-[#07542f]" aria-hidden="true" />
              {official.availability}
            </p>
            <Link href={official.contactHref} className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#f7c600] px-4 py-3 text-sm font-black uppercase text-[#001c10] transition hover:bg-[#ffd84d]">
              <Mail size={16} aria-hidden="true" />
              {official.contactLabel}
            </Link>
          </article>
        </aside>

        <div className="space-y-8">
          <section className="official-card rounded-lg bg-white p-6 sm:p-8">
            <SectionTitle eyebrow="Rôle" title="Périmètre et mission" text={official.bio} />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-[#07542f]/15 bg-[#fbfcf8] p-4">
                <ShieldCheck size={26} className="text-[#07542f]" aria-hidden="true" />
                <p className="mt-3 text-xs font-black uppercase text-[#664d00]">Catégorie</p>
                <p className="mt-1 font-black uppercase text-[#002f1d]">{official.category === "BUREAU" ? "Bureau exécutif" : "Responsable opérationnel"}</p>
              </div>
              <div className="rounded-lg border border-[#07542f]/15 bg-[#fbfcf8] p-4">
                <MapPin size={26} className="text-[#07542f]" aria-hidden="true" />
                <p className="mt-3 text-xs font-black uppercase text-[#664d00]">Pôle</p>
                <p className="mt-1 font-black uppercase text-[#002f1d]">{official.department}</p>
              </div>
              <div className="rounded-lg border border-[#07542f]/15 bg-[#fbfcf8] p-4">
                <Users size={26} className="text-[#07542f]" aria-hidden="true" />
                <p className="mt-3 text-xs font-black uppercase text-[#664d00]">Public</p>
                <p className="mt-1 font-black uppercase text-[#002f1d]">Familles, bénévoles, partenaires</p>
              </div>
            </div>
          </section>

          <section className="official-card rounded-lg bg-white p-6 sm:p-8">
            <SectionTitle eyebrow="Missions" title="Ce que ce responsable pilote" />
            <div className="grid gap-3 sm:grid-cols-2">
              {official.missions.map((mission) => (
                <div key={mission} className="flex gap-3 rounded-lg border border-slate-200 bg-[#fbfcf8] p-4">
                  <BadgeCheck size={20} className="mt-0.5 shrink-0 text-[#07542f]" aria-hidden="true" />
                  <p className="font-bold leading-6 text-slate-800">{mission}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="official-card rounded-lg bg-white p-6 sm:p-8">
            <SectionTitle eyebrow="Liens utiles" title="Accéder directement au bon espace" />
            <div className="grid gap-3 sm:grid-cols-2">
              {official.links.map((link) => (
                <Link key={`${link.href}-${link.label}`} href={link.href} className="focus-ring flex items-center justify-between rounded-lg border border-[#07542f]/15 bg-[#fbfcf8] px-4 py-4 font-black uppercase text-[#002f1d] transition hover:border-[#f7c600] hover:bg-white">
                  <span className="inline-flex items-center gap-2">
                    <LinkIcon size={17} className="text-[#07542f]" aria-hidden="true" />
                    {link.label}
                  </span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionTitle eyebrow="Réseau interne" title="Responsables associés" text="D'autres interlocuteurs proches de ce périmètre." />
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <Link key={item.id} href={profileHref(item)} className="focus-ring official-card flex items-center gap-4 rounded-lg bg-[#fbfcf8] p-4 transition hover:-translate-y-1 hover:border-[#f7c600] hover:bg-white">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#07542f] font-black uppercase text-[#f7c600] ring-2 ring-[#f7c600]" aria-hidden="true">
                    {monogram(item.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-black uppercase text-[#002f1d]">{item.name}</span>
                    <span className="block truncate text-xs font-bold uppercase text-[#07542f]">{item.position}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      </DesktopOnly>
    </>
  );
}
