import Link from "next/link";
import { ArrowRight, BadgeCheck, Camera, ClipboardList, GraduationCap, Landmark, Mail, Settings, ShieldCheck, Users } from "lucide-react";

import { FeatureCards } from "@/components/FeatureCards";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { OrganizationMap } from "@/components/club/ClubPublicBlocks";
import { OfficialsCarousel } from "@/components/club/OfficialsCarousel";
import { orgNodes } from "@/lib/club-pages-data";
import { images } from "@/lib/images";
import type { DisplayOfficial } from "@/lib/public-content";
import { getClubOfficials, getSiteSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/le-club/organigramme");
export const revalidate = 300;

type ContactGuideItem = {
  subject: string;
  description: string;
  official: DisplayOfficial;
};

function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const value = (parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "");
  return value.toUpperCase() || "?";
}

function officialHref(official: DisplayOfficial): string {
  return `/le-club/organigramme/${official.slug}`;
}

function uniqueDepartments(officials: DisplayOfficial[]): string[] {
  return Array.from(new Set(officials.map((official) => official.department)));
}

function firstByNeed(officials: DisplayOfficial[], matcher: (official: DisplayOfficial) => boolean): DisplayOfficial | null {
  return officials.find(matcher) ?? null;
}

function buildContactGuide(officials: DisplayOfficial[]): ContactGuideItem[] {
  const items: Array<{ subject: string; description: string; matcher: (official: DisplayOfficial) => boolean }> = [
    {
      subject: "Licence ou inscription",
      description: "Dossier, renouvellement, pièces manquantes, accès famille.",
      matcher: (official) => /licence|inscription/i.test(`${official.position} ${official.department}`)
    },
    {
      subject: "Projet sportif",
      description: "Orientation sportive, coordination des catégories, suivi terrain.",
      matcher: (official) => /président|gouvernance|sportif|vice/i.test(`${official.position} ${official.department}`)
    },
    {
      subject: "Partenariat",
      description: "Offres partenaires, visibilité, mécénat, relation entreprise.",
      matcher: (official) => /partenariat/i.test(`${official.position} ${official.department}`)
    },
    {
      subject: "Communication",
      description: "Actualités, photos, annonce officielle, informations publiques.",
      matcher: (official) => /communication/i.test(`${official.position} ${official.department}`)
    },
    {
      subject: "Événement club",
      description: "Tournois, bénévoles, accueil, temps forts du calendrier.",
      matcher: (official) => /événement|evenement/i.test(`${official.position} ${official.department}`)
    }
  ];

  return items
    .map((item) => {
      const official = firstByNeed(officials, item.matcher) ?? officials[0];
      return official ? { subject: item.subject, description: item.description, official } : null;
    })
    .filter((item): item is ContactGuideItem => Boolean(item));
}

function Avatar({ official, size = "h-16 w-16" }: { official: DisplayOfficial; size?: string }) {
  if (official.photo) {
    return <img src={official.photo} alt={official.name} className={`${size} rounded-full object-cover ring-2 ring-[#f7c600]`} />;
  }

  return (
    <span className={`${size} flex items-center justify-center rounded-full bg-[#07542f] text-xl font-black uppercase text-[#f7c600] ring-2 ring-[#f7c600]`} aria-hidden="true">
      {monogram(official.name)}
    </span>
  );
}

function OfficialPortrait({ official, featured = false }: { official: DisplayOfficial; featured?: boolean }) {
  const height = featured ? "h-64" : "h-52";

  return (
    <div className={`relative overflow-hidden rounded-lg border border-[#07542f]/15 bg-[#002f1d] ${height}`}>
      {official.photo ? (
        <img src={official.photo} alt={official.name} className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.03]" />
      ) : (
        <div className="stadium-grid flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_20%,rgba(247,198,0,0.18),transparent_38%),linear-gradient(145deg,#001c10,#07542f)] px-5 text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-[#001c10]/75 text-3xl font-black uppercase text-[#f7c600] ring-2 ring-[#f7c600]">
            {monogram(official.name)}
          </span>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#f7c600]/45 bg-[#001c10]/55 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#f7c600]">
            <Camera size={13} aria-hidden="true" />
            Photo à ajouter
          </span>
        </div>
      )}
      <span className="absolute left-3 top-3 rounded-full bg-[#f7c600] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#001c10] shadow">
        {official.department}
      </span>
    </div>
  );
}

function HeroStats({ bureauCount, dirigeantCount, departmentCount }: { bureauCount: number; dirigeantCount: number; departmentCount: number }) {
  const stats = [
    { label: "Bureau", value: bureauCount },
    { label: "Responsables", value: dirigeantCount },
    { label: "Pôles", value: departmentCount }
  ];

  return (
    <div className="grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-white/20 bg-[#001c10]/65 px-3 py-3 text-center backdrop-blur">
          <p className="text-2xl font-black text-[#f7c600] sm:text-3xl">{stat.value}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/80 sm:text-xs">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function DepartmentNav({ departments }: { departments: string[] }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Navigation par pôle">
      <Link href="#tous-les-responsables" className="focus-ring rounded-full bg-[#f7c600] px-4 py-2 text-xs font-black uppercase text-[#001c10] shadow-sm">
        Tous
      </Link>
      {departments.map((department) => (
        <Link key={department} href={`#pole-${department.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`} className="focus-ring rounded-full border border-[#07542f]/20 bg-white px-4 py-2 text-xs font-black uppercase text-[#07542f] shadow-sm transition hover:border-[#f7c600] hover:text-[#002f1d]">
          {department}
        </Link>
      ))}
    </nav>
  );
}

function OfficialProfileCard({ official, featured = false }: { official: DisplayOfficial; featured?: boolean }) {
  return (
    <Link
      href={officialHref(official)}
      className={`focus-ring official-card group flex h-full flex-col overflow-hidden rounded-lg bg-white text-[#002f1d] transition duration-200 hover:-translate-y-1 hover:border-[#f7c600] hover:shadow-2xl ${featured ? "ring-2 ring-[#f7c600]/70" : ""}`}
    >
      <OfficialPortrait official={official} featured={featured} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          <Avatar official={official} size="h-12 w-12" />
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-black uppercase leading-tight">{official.name}</h3>
            <p className="mt-1 text-sm font-bold uppercase tracking-wide text-[#07542f]">{official.position}</p>
          </div>
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-700">{official.bio}</p>
        <ul className="mt-4 space-y-2">
          {official.missions.slice(0, 3).map((mission) => (
            <li key={mission} className="flex gap-2 text-sm font-semibold text-slate-700">
              <BadgeCheck size={16} className="mt-0.5 shrink-0 text-[#07542f]" aria-hidden="true" />
              <span>{mission}</span>
            </li>
          ))}
        </ul>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-black uppercase text-[#07542f] group-hover:text-[#002f1d]">
          Voir le profil <ArrowRight size={16} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

function Spotlight({ president }: { president: DisplayOfficial | null }) {
  if (!president) return null;

  return (
    <section className="club-shell px-4 py-14 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase text-[#f7c600]">Direction</p>
          <div className="gold-divider mb-4 mt-2" aria-hidden="true" />
          <h2 className="text-3xl font-black uppercase sm:text-4xl">Un point d'entrée clair pour comprendre le club</h2>
        </div>
        <OfficialProfileCard official={president} featured />
      </div>
    </section>
  );
}

function OfficialsSection({ title, text, officials, featured }: { title: string; text: string; officials: DisplayOfficial[]; featured?: boolean }) {
  if (officials.length === 0) return null;

  return (
    <section id={title === "Bureau exécutif" ? "bureau" : "dirigeants"} className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle eyebrow="Responsables" title={title} text={text} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {officials.map((official) => (
          <OfficialProfileCard key={official.id} official={official} featured={featured && /président/i.test(official.position)} />
        ))}
      </div>
    </section>
  );
}

function DepartmentSection({ department, officials }: { department: string; officials: DisplayOfficial[] }) {
  const id = `pole-${department.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`;

  return (
    <article id={id} className="official-card rounded-lg bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-[#664d00]">Pôle</p>
          <h3 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">{department}</h3>
        </div>
        <span className="rounded-full bg-[#07542f]/10 px-3 py-1 text-xs font-black uppercase text-[#07542f]">{officials.length}</span>
      </div>
      <div className="mt-5 space-y-3">
        {officials.map((official) => (
          <Link key={official.id} href={officialHref(official)} className="focus-ring flex items-center gap-3 rounded-lg border border-slate-200 bg-[#fbfcf8] p-3 transition hover:border-[#f7c600] hover:bg-white">
            <Avatar official={official} size="h-11 w-11" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-black uppercase text-[#002f1d]">{official.name}</span>
              <span className="block truncate text-xs font-bold uppercase text-[#07542f]">{official.position}</span>
            </span>
          </Link>
        ))}
      </div>
    </article>
  );
}

function ContactGuide({ items }: { items: ContactGuideItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle eyebrow="Orientation" title="Qui contacter ?" text="Un accès rapide vers le bon responsable selon la demande. Chaque ligne renvoie vers un profil détaillé." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {items.map((item) => (
            <Link key={item.subject} href={officialHref(item.official)} className="focus-ring official-card group flex min-h-56 flex-col rounded-lg bg-[#fbfcf8] p-5 transition hover:-translate-y-1 hover:border-[#f7c600] hover:bg-white">
              <Mail className="text-[#07542f]" size={28} aria-hidden="true" />
              <h3 className="mt-4 text-lg font-black uppercase text-[#002f1d]">{item.subject}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{item.description}</p>
              <span className="mt-auto pt-5 text-xs font-black uppercase text-[#07542f]">
                {item.official.name} <ArrowRight className="inline" size={13} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function OrganizationPage() {
  const [{ organigramme }, officials] = await Promise.all([getSiteSettings(), getClubOfficials()]);
  const allOfficials = [...officials.bureau, ...officials.dirigeants];
  const president = officials.bureau.find((official) => /pr[ée]sident/i.test(official.position) && !/vice/i.test(official.position)) ?? null;
  const carouselOfficials = president ? allOfficials.filter((official) => official.id !== president.id) : allOfficials;
  const departments = uniqueDepartments(allOfficials);
  const contactGuide = buildContactGuide(allOfficials);

  return (
    <>
      <PageHero
        eyebrow="Le Club"
        description="Identifiez rapidement le bon responsable pour chaque sujet : projet sportif, licences, partenariats, communication ou événements."
        image={images.training}
        title="L'organisation du club"
      >
        <HeroStats bureauCount={officials.bureau.length} dirigeantCount={officials.dirigeants.length} departmentCount={departments.length} />
      </PageHero>

      <section className="border-b border-[#07542f]/10 bg-[#f7f8f4] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-[#664d00]">Navigation rapide</p>
            <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Trouvez le bon interlocuteur</h2>
          </div>
          <DepartmentNav departments={departments} />
        </div>
      </section>

      <Spotlight president={president} />

      <section id="tous-les-responsables" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Carte des rôles" title="Une direction lisible, profil par profil" text="Cliquez sur un responsable pour consulter ses missions, son périmètre et les meilleurs chemins de contact." />
        <OfficialsCarousel officials={carouselOfficials} />
      </section>

      <ContactGuide items={contactGuide} />

      <section className="bg-[#f7f8f4] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Organigramme interactif"
            title="Comprendre la structure du club"
            text="Cliquez sur un pôle pour afficher sa mission, son référent et ses rattachements. Cette vue complète les fiches publiques existantes."
          />
          <OrganizationMap nodes={orgNodes} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionTitle eyebrow="Pôles" title="Vue opérationnelle" text="Une lecture par périmètre pour comprendre qui pilote quoi dans la vie du club." />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {departments.map((department) => (
              <DepartmentSection key={department} department={department} officials={allOfficials.filter((official) => official.department === department)} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Structure" title={organigramme.title} text={organigramme.intro} />
          <div className="grid gap-5 md:grid-cols-2">
            {organigramme.groups.map((group, index) => (
              <article className="ac-frame relative overflow-hidden p-7" key={group.title}>
                <span className="ac-accent-bar" aria-hidden="true" />
                <span className="pointer-events-none absolute right-5 top-2 text-6xl font-black tabular-nums text-[#002f1d]/[0.06]" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="relative text-2xl font-black uppercase text-[#002f1d]">{group.title}</h2>
                <p className="relative mt-3 leading-7 text-slate-700">{group.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="club-shell px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle inverse eyebrow="Fonctionnement" title="Une organisation au service du terrain" text="Chaque pôle doit soutenir la progression des joueurs et la qualité d'accueil des familles." />
          <FeatureCards
            inverse
            items={[
              { title: "Décision", text: "Un bureau qui fixe le cap et garantit la cohérence du projet.", icon: Landmark },
              { title: "Sportif", text: "Une direction technique qui structure les catégories.", icon: GraduationCap },
              { title: "Administratif", text: "Des procédures claires pour les licences, documents et inscriptions.", icon: ClipboardList },
              { title: "Opérationnel", text: "Des rôles lisibles pour fluidifier la vie du club.", icon: Settings },
              { title: "Accueil", text: "Un responsable identifiable pour orienter familles, bénévoles et partenaires.", icon: Users },
              { title: "Confiance", text: "Des profils publics qui clarifient les missions et les bons contacts.", icon: ShieldCheck }
            ]}
          />
        </div>
      </section>
    </>
  );
}
