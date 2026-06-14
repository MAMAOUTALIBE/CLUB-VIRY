import "server-only";

import { cache } from "react";

import type { LucideIcon } from "lucide-react";

import { news as mockNews, partners as mockPartners, products as mockProducts, teams as mockTeams } from "@/lib/data";
import { getPublishedNewsBySlug, listPartnersForAdmin, listPublicMedia, listPublishedNews, listTeamMedia } from "@/lib/db/content";
import { listPublicProducts } from "@/lib/db/recruitment-shop";
import { getAllSettings } from "@/lib/db/settings";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";
import { getPublicTeamRosterBySlug, listTeams } from "@/lib/db/teams";
import { listPublicEducators } from "@/lib/db/educators";
import { listClubOfficials } from "@/lib/db/officials";
import type { Match, NewsArticle } from "@/lib/db/types";
import { images } from "@/lib/images";
import { slugify } from "@/lib/slug";

/**
 * Couche de lecture publique du contenu éditorial.
 * - Si Supabase est configuré ET qu'il y a du contenu publié → on lit la base
 *   (ce que l'admin a saisi dans le CRM).
 * - Sinon (mode vitrine, ou base vide, ou erreur) → repli sur les données mockées,
 *   pour que le site reste toujours présentable.
 */
export type DisplayNews = {
  title: string;
  slug: string;
  date: string;
  isoDate: string;
  category: string;
  excerpt: string;
  image: string;
  content?: string;
};

const frDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });

function formatFr(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : frDate.format(d);
}

function fromMock(): DisplayNews[] {
  return mockNews.map((n) => ({
    title: n.title,
    slug: slugify(n.title),
    date: n.date,
    isoDate: n.isoDate,
    category: n.category,
    excerpt: n.excerpt,
    image: n.image
  }));
}

function mapNewsRow(a: NewsArticle): DisplayNews {
  const iso = a.published_at ?? a.created_at;
  return {
    title: a.title,
    slug: a.slug || slugify(a.title),
    date: formatFr(iso),
    isoDate: (iso ?? "").slice(0, 10),
    category: "Actualité",
    excerpt: a.excerpt ?? "",
    image: a.cover_image_url || images.teamHuddle,
    content: a.content
  };
}

export async function getPublicNews(limit = 12): Promise<DisplayNews[]> {
  if (isSupabaseAdminConfigured) {
    try {
      const rows = await listPublishedNews(limit);
      if (rows.length > 0) {
        return rows.map(mapNewsRow);
      }
    } catch {
      // repli mock ci-dessous
    }
  }
  return fromMock();
}

// Fetch direct par slug (index) + cache() pour dédupliquer entre generateMetadata et le rendu.
export const getPublicNewsBySlug = cache(async (slug: string): Promise<DisplayNews | null> => {
  if (isSupabaseAdminConfigured) {
    try {
      const row = await getPublishedNewsBySlug(slug);
      if (row) {
        return mapNewsRow(row);
      }
    } catch {
      // repli mock ci-dessous
    }
  }
  return fromMock().find((article) => article.slug === slug) ?? null;
});

export type DisplayPartner = { name: string; logoUrl: string | null; websiteUrl: string | null; tier: string | null };

export async function getPublicPartners(): Promise<DisplayPartner[]> {
  if (isSupabaseAdminConfigured) {
    try {
      const rows = await listPartnersForAdmin(100);
      const active = rows
        .filter((p) => p.is_active)
        .sort((a, b) => a.order_index - b.order_index);
      if (active.length > 0) {
        return active.map((p) => ({ name: p.name, logoUrl: p.logo_url, websiteUrl: p.website_url, tier: p.tier }));
      }
    } catch {
      // repli mock
    }
  }
  return mockPartners.map((name) => ({ name, logoUrl: null, websiteUrl: null, tier: null }));
}

export type DisplayProduct = { name: string; price: string; category: string; imageUrl: string | null; icon: LucideIcon | null };

function priceFr(cents: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: currency || "EUR" }).format(cents / 100);
}

export async function getPublicProducts(): Promise<DisplayProduct[]> {
  if (isSupabaseAdminConfigured) {
    try {
      const { products } = await listPublicProducts();
      if (products.length > 0) {
        return products.map((p) => ({ name: p.name, price: priceFr(p.price_cents, p.currency), category: "Boutique", imageUrl: p.image_url, icon: null }));
      }
    } catch {
      // repli mock
    }
  }
  return mockProducts.map((p) => ({ name: p.name, price: p.price, category: p.category, imageUrl: null, icon: p.icon }));
}

export type DisplayAlbum = { title: string; image: string };

export type DisplayStat = { label: string; value: string; iconName: string };
export type DisplayValue = { title: string; text: string; iconName: string };
export type DisplayHistoryItem = { year: string; title: string; text: string; iconName: string };
export type OrgGroup = { title: string; text: string };
export type StadePhoto = { src: string; alt: string; caption: string };
export type HistoireContent = { eyebrow: string; title: string; intro: string; timeline: DisplayHistoryItem[] };
export type OrganigrammeContent = { title: string; intro: string; groups: OrgGroup[] };
export type StadeContent = { address: string; mapsQuery: string; infrastructures: string[]; gallery: StadePhoto[] };

export type SiteContent = {
  socials: { facebook: string; instagram: string; youtube: string; tiktok: string; whatsapp: string };
  contact: { phone1: string; phone2: string; email: string; address: string };
  president: { name: string; message: string; photoUrl: string };
  inscriptions_banner: { text: string; active: boolean };
  club_stats: DisplayStat[];
  values: DisplayValue[];
  histoire: HistoireContent;
  organigramme: OrganigrammeContent;
  stade: StadeContent;
};

const SETTINGS_DEFAULTS: SiteContent = {
  socials: { facebook: "", instagram: "", youtube: "", tiktok: "", whatsapp: "" },
  contact: { phone1: "06 29 67 04 33", phone2: "01 69 96 67 00", email: "esvirychatillon91170@gmail.com", address: "Stade Henri Longuet, 91170 Viry-Châtillon" },
  president: { name: "Saglam Ferhat", message: "", photoUrl: "" },
  inscriptions_banner: { text: "Inscriptions des licenciés : du 09 juin jusqu'à la fin du mois de juin — rejoignez l'ES Viry-Châtillon !", active: true },
  club_stats: [
    { label: "Licenciés", value: "+600", iconName: "Users" },
    { label: "Éducateurs", value: "50", iconName: "Award" },
    { label: "Équipes", value: "30", iconName: "Shield" },
    { label: "Places", value: "5 700", iconName: "Building2" },
    { label: "Depuis", value: "1958", iconName: "CalendarDays" }
  ],
  values: [
    { title: "Respect", text: "Le respect de chacun, règle du jeu.", iconName: "Handshake" },
    { title: "Travail", text: "Le travail et l'effort sont nos moteurs.", iconName: "Dumbbell" },
    { title: "Solidarité", text: "On se tire toujours vers le haut.", iconName: "HeartHandshake" },
    { title: "Ambition", text: "Viser l'excellence pour aller plus loin.", iconName: "Target" },
    { title: "Passion", text: "Une passion qui nous unit tous.", iconName: "Trophy" }
  ],
  histoire: {
    eyebrow: "Notre parcours",
    title: "Depuis 1958",
    intro: "L'ES Viry-Châtillon Football grandit avec sa ville. L'histoire du club est celle d'une transmission : former, rassembler et faire progresser.",
    timeline: [
      { year: "1958", title: "Naissance du club", text: "Fusion de l'US Viry et du FC Viry : naissance de l'ES Viry-Châtillon.", iconName: "Flag" },
      { year: "1980-90", title: "L'essor de la formation", text: "Développement de la formation et structuration des catégories jeunes.", iconName: "GraduationCap" },
      { year: "2000", title: "Ancrage régional", text: "Montée en exigences régionales et rayonnement local renforcé.", iconName: "TrendingUp" },
      { year: "Aujourd'hui", title: "Tournés vers l'avenir", text: "Un club familial, formateur et tourné vers l'avenir.", iconName: "HeartHandshake" }
    ]
  },
  organigramme: {
    title: "Structure du club",
    intro: "Une organisation claire permet au club d'être lisible pour les familles, les éducateurs et les partenaires.",
    groups: [
      { title: "Bureau", text: "Président, vice-présidents, trésorerie, secrétariat général" },
      { title: "Direction sportive", text: "Responsable technique, coordinateurs catégories, référents gardiens" },
      { title: "Éducateurs", text: "École de foot, jeunes, seniors, féminines, futsal" },
      { title: "Administration", text: "Licences, inscriptions, communication, partenariats" }
    ]
  },
  stade: {
    address: "Stade Henri Longuet, Avenue de l'Armée Leclerc, 91170 Viry-Châtillon",
    mapsQuery: "Stade Henri Longuet, Viry-Châtillon",
    infrastructures: ["2 terrains", "Vestiaires modernes", "Club house convivial", "Tribunes supporters"],
    gallery: [
      { src: images.stadeTribune, alt: "Tribune principale et piste d'athlétisme du Stade Henri Longuet", caption: "La tribune principale et la piste" },
      { src: images.stadeTribune2, alt: "Vue rapprochée de la tribune depuis la piste", caption: "La tribune vue depuis la piste" }
    ]
  }
};

/** Retourne le tableau stocké s'il est non vide, sinon le défaut (saisie CMS défensive). */
function pickArray<T>(raw: unknown, fallback: T[]): T[] {
  return Array.isArray(raw) && raw.length > 0 ? (raw as T[]) : fallback;
}

/** Retourne la chaîne stockée si non vide, sinon le défaut. */
function pickStr(raw: unknown, fallback: string): string {
  return typeof raw === "string" && raw.trim() !== "" ? raw : fallback;
}

export async function getSiteSettings(): Promise<SiteContent> {
  if (isSupabaseAdminConfigured) {
    try {
      const all = await getAllSettings();
      const stats = all.club_stats as Record<string, unknown> | undefined;
      const vals = all.values as Record<string, unknown> | undefined;
      const hist = all.histoire as Record<string, unknown> | undefined;
      const org = all.organigramme as Record<string, unknown> | undefined;
      const stade = all.stade as Record<string, unknown> | undefined;
      return {
        socials: { ...SETTINGS_DEFAULTS.socials, ...(all.socials ?? {}) },
        contact: { ...SETTINGS_DEFAULTS.contact, ...(all.contact ?? {}) },
        president: { ...SETTINGS_DEFAULTS.president, ...(all.president ?? {}) },
        inscriptions_banner: { ...SETTINGS_DEFAULTS.inscriptions_banner, ...(all.inscriptions_banner ?? {}) },
        club_stats: pickArray<DisplayStat>(stats?.items, SETTINGS_DEFAULTS.club_stats),
        values: pickArray<DisplayValue>(vals?.items, SETTINGS_DEFAULTS.values),
        histoire: {
          eyebrow: pickStr(hist?.eyebrow, SETTINGS_DEFAULTS.histoire.eyebrow),
          title: pickStr(hist?.title, SETTINGS_DEFAULTS.histoire.title),
          intro: pickStr(hist?.intro, SETTINGS_DEFAULTS.histoire.intro),
          timeline: pickArray<DisplayHistoryItem>(hist?.timeline, SETTINGS_DEFAULTS.histoire.timeline)
        },
        organigramme: {
          title: pickStr(org?.title, SETTINGS_DEFAULTS.organigramme.title),
          intro: pickStr(org?.intro, SETTINGS_DEFAULTS.organigramme.intro),
          groups: pickArray<OrgGroup>(org?.groups, SETTINGS_DEFAULTS.organigramme.groups)
        },
        stade: {
          address: pickStr(stade?.address, SETTINGS_DEFAULTS.stade.address),
          mapsQuery: pickStr(stade?.mapsQuery, SETTINGS_DEFAULTS.stade.mapsQuery),
          infrastructures: pickArray<string>(stade?.infrastructures, SETTINGS_DEFAULTS.stade.infrastructures),
          gallery: pickArray<StadePhoto>(stade?.gallery, SETTINGS_DEFAULTS.stade.gallery)
        }
      } as SiteContent;
    } catch {
      // repli défauts
    }
  }
  return SETTINGS_DEFAULTS;
}

export async function getPublicAlbums(): Promise<DisplayAlbum[]> {
  if (isSupabaseAdminConfigured) {
    try {
      const { albums } = await listPublicMedia();
      if (albums.length > 0) {
        return albums.map((a) => ({ title: a.title, image: a.cover_image_url || images.teamHuddle }));
      }
    } catch {
      // repli mock
    }
  }
  return mockNews.map((n) => ({ title: n.title, image: n.image }));
}

export type DisplayTeam = { slug: string; name: string; category: string; season: string; description: string; image: string };
export type DisplayTeamStaff = { name: string; role: string; isHeadCoach: boolean };
export type DisplayTeamPlayer = { name: string; position: string; shirtNumber: number | null };
export type DisplayTeamMedia = { type: string; url: string; thumbnail: string | null; title: string };
export type DisplayTeamDetail = DisplayTeam & {
  coach: string;
  staff: DisplayTeamStaff[];
  players: DisplayTeamPlayer[];
  nextMatch: string;
  media: DisplayTeamMedia[];
};

const DEFAULT_SEASON = "2025 / 2026";

/** Affichage public d'un nom de joueur : prénom + initiale du nom (protection PII). */
function publicPlayerName(firstName: string, lastName: string): string {
  const initial = lastName?.trim() ? `${lastName.trim().charAt(0).toUpperCase()}.` : "";
  return `${firstName ?? ""} ${initial}`.trim();
}

function formatNextMatch(matches: Match[]): string {
  const now = Date.now();
  const next = matches.find((m) => m.starts_at && new Date(m.starts_at).getTime() >= now);
  if (!next?.starts_at) {
    return "Calendrier à confirmer";
  }
  const formatted = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(next.starts_at));
  return next.opponent_name ? `${formatted} contre ${next.opponent_name}` : formatted;
}

export async function getPublicTeams(): Promise<DisplayTeam[]> {
  if (isSupabaseAdminConfigured) {
    try {
      const rows = await listTeams();
      if (rows.length > 0) {
        return rows.map((t) => ({
          slug: t.slug,
          name: t.name,
          category: t.age_range ?? t.level ?? "Équipe",
          season: DEFAULT_SEASON,
          description: t.description ?? "",
          image: t.cover_image_url || images.teamHuddle
        }));
      }
    } catch {
      // repli mock
    }
  }
  return mockTeams.map((t) => ({ slug: t.slug, name: t.name, category: t.category, season: t.season, description: t.description, image: t.image }));
}

export async function getPublicTeamBySlug(slug: string): Promise<DisplayTeamDetail | null> {
  if (isSupabaseAdminConfigured) {
    try {
      const roster = await getPublicTeamRosterBySlug(slug);
      if (roster) {
        const head = roster.staff.find((s) => s.is_head_coach) ?? roster.staff[0];
        return {
          slug: roster.team.slug,
          name: roster.team.name,
          category: roster.team.age_range ?? roster.team.level ?? "Équipe",
          season: DEFAULT_SEASON,
          description: roster.team.description ?? "",
          image: roster.team.cover_image_url || images.teamHuddle,
          coach: head?.display_name ?? "À confirmer",
          staff: roster.staff.map((s) => ({ name: s.display_name, role: s.role_title, isHeadCoach: s.is_head_coach })),
          players: roster.players.map((p) => ({
            name: p.player ? publicPlayerName(p.player.first_name, p.player.last_name) : "Joueur",
            position: p.assignment.position ?? "",
            shirtNumber: p.assignment.shirt_number
          })),
          nextMatch: formatNextMatch(roster.matches),
          media: (await listTeamMedia(roster.team.id)).map((asset) => ({ type: asset.type, url: asset.url, thumbnail: asset.thumbnail_url, title: asset.title }))
        };
      }
      // slug absent en base → on retombe sur les données mock ci-dessous (les fiches vitrine restent visibles).
    } catch {
      // repli mock
    }
  }
  const mock = mockTeams.find((t) => t.slug === slug);
  if (!mock) {
    return null;
  }
  return {
    slug: mock.slug,
    name: mock.name,
    category: mock.category,
    season: mock.season,
    description: mock.description,
    image: mock.image,
    coach: mock.coach,
    staff: [
      { name: mock.coach, role: "Coach principal", isHeadCoach: true },
      { name: mock.assistant, role: "Adjoint", isHeadCoach: false }
    ],
    players: mock.players.map((name) => ({ name, position: "", shirtNumber: null })),
    nextMatch: mock.nextMatch,
    media: []
  };
}

// --- Encadrement : annuaire public des éducateurs (opt-in) -------------------

export type DisplayEducatorTeam = { name: string; slug: string; category: string; roleTitle: string; isHeadCoach: boolean };
export type DisplayEducator = {
  id: string;
  name: string;
  slug: string;
  title: string;
  diploma: string | null;
  joinedYear: number | null;
  diplomas: string[];
  specialties: string[];
  quote: string | null;
  avatar: string | null;
  bio: string;
  teams: DisplayEducatorTeam[];
  stats: { teams: number; sessions: number; matches: number };
};

// Slug unique et déterministe par éducateur (évite les collisions d'homonymes :
// deux "Mohamed Diallo" ont des slugs distincts ; un nom vide reste routable).
export function educatorSlug(name: string, id: string): string {
  return `${slugify(name) || "educateur"}-${id.slice(0, 8)}`;
}

// Données vitrine affichées tant qu'aucun éducateur n'est publié depuis le CRM.
const mockEducators: DisplayEducator[] = [
  {
    id: "mock-1",
    name: "Karim Benali",
    title: "Responsable technique",
    diploma: "UEFA B",
    slug: educatorSlug("Karim Benali", "mock-1"),
    joinedYear: 2017,
    diplomas: ["UEFA B (2021)", "PSC1 (2019)"],
    specialties: ["Technique", "Coordination"],
    quote: "Former des joueurs, c'est d'abord former des personnes.",
    avatar: null,
    bio: "Éducateur diplômé, en charge de la coordination sportive et de la formation des jeunes catégories.",
    teams: [
      { name: "Seniors D1", slug: "seniors-r1", category: "Seniors", roleTitle: "Entraîneur principal", isHeadCoach: true },
      { name: "U18", slug: "u18", category: "U18", roleTitle: "Référent", isHeadCoach: false }
    ],
    stats: { teams: 2, sessions: 48, matches: 22 }
  },
  {
    id: "mock-2",
    name: "Awa Diallo",
    title: "Éducatrice École de foot",
    diploma: "CFF1",
    slug: educatorSlug("Awa Diallo", "mock-2"),
    joinedYear: 2020,
    diplomas: ["CFF1 (2020)"],
    specialties: ["École de foot", "Motricité"],
    quote: "Donner le goût du jeu dès le plus jeune âge.",
    avatar: null,
    bio: "Passionnée par l'apprentissage des plus jeunes, elle encadre l'école de foot avec exigence et bienveillance.",
    teams: [{ name: "École de foot", slug: "ecole-de-foot", category: "U6 à U11", roleTitle: "Entraîneure principale", isHeadCoach: true }],
    stats: { teams: 1, sessions: 30, matches: 12 }
  },
  {
    id: "mock-3",
    name: "Lucas Moreau",
    title: "Entraîneur Futsal",
    diploma: "CFF Futsal",
    slug: educatorSlug("Lucas Moreau", "mock-3"),
    joinedYear: 2015,
    diplomas: ["CFF Futsal (2022)", "CFF3 (2018)"],
    specialties: ["Futsal", "Jeu rapide"],
    quote: "Le futsal aiguise la technique et la prise de décision.",
    avatar: null,
    bio: "Ancien joueur du club, il transmet sa connaissance du jeu rapide aux équipes futsal.",
    teams: [{ name: "Futsal", slug: "futsal", category: "Seniors", roleTitle: "Entraîneur principal", isHeadCoach: true }],
    stats: { teams: 1, sessions: 26, matches: 15 }
  },
  {
    id: "mock-4",
    name: "Sophie Laurent",
    title: "Éducatrice Féminines",
    diploma: "UEFA C",
    slug: educatorSlug("Sophie Laurent", "mock-4"),
    joinedYear: 2019,
    diplomas: ["UEFA C (2023)"],
    specialties: ["Football féminin", "Mental"],
    quote: "Faire grandir le football féminin, match après match.",
    avatar: null,
    bio: "Engagée pour le développement du football féminin au club, elle accompagne les joueuses tout au long de la saison.",
    teams: [{ name: "Féminines", slug: "feminines", category: "Seniors", roleTitle: "Entraîneure principale", isHeadCoach: true }],
    stats: { teams: 1, sessions: 28, matches: 14 }
  }
];

export async function getPublicEducators(): Promise<DisplayEducator[]> {
  if (isSupabaseAdminConfigured) {
    try {
      const rows = await listPublicEducators();
      if (rows.length > 0) {
        return rows.map((r) => {
          const head = r.teams.find((t) => t.isHeadCoach);
          const name = r.name?.trim() || "Éducateur";
          return {
            id: r.id,
            name,
            slug: educatorSlug(name, r.id),
            title: r.title?.trim() || head?.roleTitle || "Éducateur",
            diploma: r.diploma?.trim() || null,
            joinedYear: r.joined_year ?? null,
            diplomas: Array.isArray(r.diplomas) ? r.diplomas : [],
            specialties: Array.isArray(r.specialties) ? r.specialties : [],
            quote: r.quote?.trim() || null,
            avatar: r.avatar_url,
            bio: r.bio ?? "",
            teams: r.teams,
            stats: { teams: r.team_count, sessions: r.session_count, matches: r.match_count }
          };
        });
      }
    } catch {
      // repli mock
    }
  }
  return mockEducators;
}

// Fiche éducateur par slug (page détail). Réutilise getPublicEducators (cache léger).
export async function getPublicEducatorBySlug(slug: string): Promise<DisplayEducator | null> {
  const all = await getPublicEducators();
  return all.find((educator) => educator.slug === slug) ?? null;
}

// --- Direction : bureau exécutif + dirigeants (personnes) -------------------

export type DisplayOfficial = { id: string; name: string; position: string; photo: string | null };
export type ClubOfficialsContent = { bureau: DisplayOfficial[]; dirigeants: DisplayOfficial[] };

// Données vitrine tant qu'aucun membre n'est saisi depuis le CRM.
const mockOfficials: ClubOfficialsContent = {
  bureau: [
    { id: "b1", name: "Saglam Ferhat", position: "Président", photo: null },
    { id: "b2", name: "A. Martin", position: "Vice-président", photo: null },
    { id: "b3", name: "K. Sow", position: "Trésorier", photo: null },
    { id: "b4", name: "M. Dubois", position: "Secrétaire général", photo: null }
  ],
  dirigeants: [
    { id: "d1", name: "L. Petit", position: "Responsable des licences", photo: null },
    { id: "d2", name: "R. Garcia", position: "Responsable communication", photo: null },
    { id: "d3", name: "S. Bernard", position: "Responsable partenariats", photo: null },
    { id: "d4", name: "N. Roux", position: "Responsable événementiel", photo: null }
  ]
};

export async function getClubOfficials(): Promise<ClubOfficialsContent> {
  if (isSupabaseAdminConfigured) {
    try {
      const rows = await listClubOfficials();
      if (rows.length > 0) {
        const toDisplay = (r: (typeof rows)[number]): DisplayOfficial => ({ id: r.id, name: r.full_name, position: r.position, photo: r.photo_url });
        return {
          bureau: rows.filter((r) => r.category === "BUREAU").map(toDisplay),
          dirigeants: rows.filter((r) => r.category === "DIRIGEANT").map(toDisplay)
        };
      }
    } catch {
      // repli mock
    }
  }
  return mockOfficials;
}
