import "server-only";

import { cache } from "react";

import type { LucideIcon } from "lucide-react";

import { news as mockNews, partners as mockPartners, products as mockProducts, teams as mockTeams } from "@/lib/data";
import { getPublishedNewsBySlug, listPartnersForAdmin, listPublicMedia, listPublishedNews, listTeamMedia } from "@/lib/db/content";
import { listPublicProducts } from "@/lib/db/recruitment-shop";
import { getAllSettings } from "@/lib/db/settings";
import { getPublicTeamRosterBySlug, listTeams } from "@/lib/db/teams";
import { listPublicEducators } from "@/lib/db/educators";
import { listClubOfficials } from "@/lib/db/officials";
import type { Match, NewsArticle } from "@/lib/db/types";
import { images } from "@/lib/images";
import { readPublicDb } from "@/lib/public-db";
import { slugify } from "@/lib/slug";
import type { StaffPerson } from "@/lib/club-pages-data";

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
  const rows = await readPublicDb(() => listPublishedNews(limit));
  if (rows && rows.length > 0) {
    return rows.map(mapNewsRow);
  }
  return fromMock();
}

// Fetch direct par slug (index) + cache() pour dédupliquer entre generateMetadata et le rendu.
export const getPublicNewsBySlug = cache(async (slug: string): Promise<DisplayNews | null> => {
  const row = await readPublicDb(() => getPublishedNewsBySlug(slug));
  if (row) {
    return mapNewsRow(row);
  }
  return fromMock().find((article) => article.slug === slug) ?? null;
});

export type DisplayPartner = { name: string; logoUrl: string | null; websiteUrl: string | null; tier: string | null };

export async function getPublicPartners(): Promise<DisplayPartner[]> {
  const rows = await readPublicDb(() => listPartnersForAdmin(100));
  const active = (rows ?? [])
    .filter((p) => p.is_active)
    .sort((a, b) => a.order_index - b.order_index);
  if (active.length > 0) {
    return active.map((p) => ({ name: p.name, logoUrl: p.logo_url, websiteUrl: p.website_url, tier: p.tier }));
  }
  return mockPartners.map((name) => ({ name, logoUrl: null, websiteUrl: null, tier: null }));
}

export type DisplayProduct = { name: string; price: string; category: string; imageUrl: string | null; icon: LucideIcon | null };

function priceFr(cents: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: currency || "EUR" }).format(cents / 100);
}

export async function getPublicProducts(): Promise<DisplayProduct[]> {
  const payload = await readPublicDb(() => listPublicProducts());
  if (payload && payload.products.length > 0) {
    return payload.products.map((p) => ({ name: p.name, price: priceFr(p.price_cents, p.currency), category: "Boutique", imageUrl: p.image_url, icon: null }));
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
  president: { name: "SAGLAM FERHAT", message: "", photoUrl: "" },
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
      { title: "Éducateurs", text: "École de foot, jeunes, seniors, féminines" },
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

function withoutRetiredPublicMentions(groups: OrgGroup[]): OrgGroup[] {
  return groups.map((group) => ({
    ...group,
    text: group.text.replace(/,\s*futsal\b/gi, "").replace(/\s+et\s+futsal\b/gi, "")
  }));
}

export async function getSiteSettings(): Promise<SiteContent> {
  const all = await readPublicDb(() => getAllSettings());
  if (all) {
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
        groups: withoutRetiredPublicMentions(pickArray<OrgGroup>(org?.groups, SETTINGS_DEFAULTS.organigramme.groups))
      },
      stade: {
        address: pickStr(stade?.address, SETTINGS_DEFAULTS.stade.address),
        mapsQuery: pickStr(stade?.mapsQuery, SETTINGS_DEFAULTS.stade.mapsQuery),
        infrastructures: pickArray<string>(stade?.infrastructures, SETTINGS_DEFAULTS.stade.infrastructures),
        gallery: pickArray<StadePhoto>(stade?.gallery, SETTINGS_DEFAULTS.stade.gallery)
      }
    } as SiteContent;
  }
  return SETTINGS_DEFAULTS;
}

export async function getPublicAlbums(): Promise<DisplayAlbum[]> {
  const payload = await readPublicDb(() => listPublicMedia());
  if (payload && payload.albums.length > 0) {
    return payload.albums.map((a) => ({ title: a.title, image: a.cover_image_url || images.teamHuddle }));
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
const RETIRED_PUBLIC_TEAM_SLUGS = new Set(["futsal"]);

function isPublicTeamVisible(slug: string): boolean {
  return !RETIRED_PUBLIC_TEAM_SLUGS.has(slug);
}

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
  const rows = await readPublicDb(() => listTeams());
  if (rows && rows.length > 0) {
    return rows
      .filter((t) => isPublicTeamVisible(t.slug))
      .map((t) => ({
        slug: t.slug,
        name: t.name,
        category: t.age_range ?? t.level ?? "Équipe",
        season: DEFAULT_SEASON,
        description: t.description ?? "",
        image: t.cover_image_url || images.teamHuddle
      }));
  }
  return mockTeams
    .filter((t) => isPublicTeamVisible(t.slug))
    .map((t) => ({ slug: t.slug, name: t.name, category: t.category, season: t.season, description: t.description, image: t.image }));
}

export async function getPublicTeamBySlug(slug: string): Promise<DisplayTeamDetail | null> {
  if (!isPublicTeamVisible(slug)) {
    return null;
  }

  const roster = await readPublicDb(() => getPublicTeamRosterBySlug(slug));
  if (roster) {
    const head = roster.staff.find((s) => s.is_head_coach) ?? roster.staff[0];
    const media = await readPublicDb(() => listTeamMedia(roster.team.id));
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
      media: (media ?? []).map((asset) => ({ type: asset.type, url: asset.url, thumbnail: asset.thumbnail_url, title: asset.title }))
    };
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

function withoutRetiredTeamAssignments(educator: DisplayEducator): DisplayEducator | null {
  const teams = educator.teams.filter((team) => isPublicTeamVisible(team.slug));
  if (teams.length === 0) {
    return null;
  }

  return { ...educator, teams, stats: { ...educator.stats, teams: teams.length } };
}

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
      { name: "U18", slug: "u18-r1", category: "U18", roleTitle: "Référent", isHeadCoach: false }
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
  },
  {
    id: "mock-5",
    name: "Thomas Renaud",
    title: "Éducateur U15",
    diploma: "UEFA C",
    slug: educatorSlug("Thomas Renaud", "mock-5"),
    joinedYear: 2018,
    diplomas: ["UEFA C (2022)", "CFF3 (2019)"],
    specialties: ["Préformation", "Transitions"],
    quote: "La progression vient de l'exigence répétée à l'entraînement.",
    avatar: null,
    bio: "Référent de la catégorie U15, il accompagne les joueurs dans les premières exigences de la compétition à 11.",
    teams: [{ name: "U15 R1", slug: "u15-r1", category: "U15", roleTitle: "Entraîneur principal", isHeadCoach: true }],
    stats: { teams: 1, sessions: 36, matches: 18 }
  },
  {
    id: "mock-6",
    name: "Lina Roussel",
    title: "Coordinatrice préformation",
    diploma: "CFF3",
    slug: educatorSlug("Lina Roussel", "mock-6"),
    joinedYear: 2021,
    diplomas: ["CFF3 (2021)", "Module préparation mentale (2023)"],
    specialties: ["Préformation", "Projet de jeu"],
    quote: "Construire un joueur, c'est l'aider à comprendre le jeu.",
    avatar: null,
    bio: "Elle assure le lien entre les catégories U15 et U18 pour harmoniser les principes de jeu et le suivi individuel.",
    teams: [
      { name: "U18", slug: "u18-r1", category: "U18", roleTitle: "Adjointe", isHeadCoach: false },
      { name: "U15 R1", slug: "u15-r1", category: "U15", roleTitle: "Référente préformation", isHeadCoach: false }
    ],
    stats: { teams: 2, sessions: 42, matches: 20 }
  },
  {
    id: "mock-8",
    name: "Julie Caron",
    title: "Adjointe Féminines",
    diploma: "CFF2",
    slug: educatorSlug("Julie Caron", "mock-8"),
    joinedYear: 2023,
    diplomas: ["CFF2 (2023)"],
    specialties: ["Développement féminin", "Animation offensive"],
    quote: "Chaque joueuse doit trouver sa place et oser prendre des initiatives.",
    avatar: null,
    bio: "Elle accompagne le groupe féminin sur les séances terrain, le suivi des jeunes joueuses et la préparation des matchs.",
    teams: [{ name: "Féminines", slug: "feminines", category: "Seniors", roleTitle: "Adjointe", isHeadCoach: false }],
    stats: { teams: 1, sessions: 22, matches: 11 }
  },
  {
    id: "mock-9",
    name: "Mamadou Keita",
    title: "Référent gardiens",
    diploma: "Module gardiens",
    slug: educatorSlug("Mamadou Keita", "mock-9"),
    joinedYear: 2016,
    diplomas: ["Module gardiens (2020)", "CFF2 (2018)"],
    specialties: ["Gardiens", "Lecture du jeu"],
    quote: "Un gardien moderne participe au jeu autant qu'il protège son but.",
    avatar: null,
    bio: "Il suit les gardiens des catégories compétition avec un travail spécifique sur les appuis, la relance et la communication.",
    teams: [
      { name: "Seniors D1", slug: "seniors-r1", category: "Seniors", roleTitle: "Référent gardiens", isHeadCoach: false },
      { name: "U18", slug: "u18-r1", category: "U18", roleTitle: "Référent gardiens", isHeadCoach: false }
    ],
    stats: { teams: 2, sessions: 34, matches: 16 }
  },
  {
    id: "mock-10",
    name: "Nabil Aït-Brahim",
    title: "Éducateur U10-U11",
    diploma: "CFF1",
    slug: educatorSlug("Nabil Aït-Brahim", "mock-10"),
    joinedYear: 2024,
    diplomas: ["CFF1 (2024)"],
    specialties: ["École de foot", "Coordination motrice"],
    quote: "À cet âge, le plaisir et les bons repères font progresser vite.",
    avatar: null,
    bio: "Il encadre les groupes U10-U11 sur les plateaux et les séances de découverte du jeu collectif.",
    teams: [{ name: "École de foot", slug: "ecole-de-foot", category: "U6 à U11", roleTitle: "Éducateur U10-U11", isHeadCoach: false }],
    stats: { teams: 1, sessions: 25, matches: 10 }
  }
];

export async function getPublicEducators(): Promise<DisplayEducator[]> {
  const rows = await readPublicDb(() => listPublicEducators());
  if (rows && rows.length > 0) {
    return rows
      .map((r) => {
        const teams = r.teams.filter((team) => isPublicTeamVisible(team.slug));
        const head = teams.find((t) => t.isHeadCoach);
        const name = r.name?.trim() || "Éducateur";
        return withoutRetiredTeamAssignments({
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
          teams,
          stats: { teams: r.team_count, sessions: r.session_count, matches: r.match_count }
        });
      })
      .filter((educator): educator is DisplayEducator => educator !== null);
  }
  return mockEducators
    .map(withoutRetiredTeamAssignments)
    .filter((educator): educator is DisplayEducator => educator !== null);
}

// Fiche éducateur par slug (page détail). Réutilise getPublicEducators (cache léger).
export async function getPublicEducatorBySlug(slug: string): Promise<DisplayEducator | null> {
  const all = await getPublicEducators();
  return all.find((educator) => educator.slug === slug) ?? null;
}

// --- Direction : bureau exécutif + dirigeants (personnes) -------------------

export type DisplayOfficialLink = { label: string; href: string };
export type DisplayOfficial = {
  id: string;
  name: string;
  slug: string;
  category: "BUREAU" | "DIRIGEANT";
  position: string;
  department: string;
  photo: string | null;
  bio: string;
  missions: string[];
  availability: string;
  contactLabel: string;
  contactHref: string;
  links: DisplayOfficialLink[];
};
export type ClubOfficialsContent = { bureau: DisplayOfficial[]; dirigeants: DisplayOfficial[] };

type OfficialProfileSeed = {
  id: string;
  name: string;
  category: DisplayOfficial["category"];
  position: string;
  department: string;
  photo?: string | null;
  bio: string;
  missions: string[];
  availability: string;
  contactLabel?: string;
  contactHref?: string;
  links?: DisplayOfficialLink[];
};

function officialSlug(name: string, id: string): string {
  return `${slugify(name) || "responsable"}-${id.slice(0, 8)}`;
}

function inferOfficialProfile(position: string, category: DisplayOfficial["category"]): Pick<DisplayOfficial, "department" | "bio" | "missions" | "availability" | "contactLabel" | "contactHref" | "links"> {
  const normalized = position.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  if (normalized.includes("vice")) {
    return {
      department: "Gouvernance",
      bio: "Bras droit de la présidence, il assure la continuité des décisions du bureau, la coordination interne et le suivi des dossiers transverses du club.",
      missions: ["Seconder la présidence", "Coordonner les responsables de pôle", "Assurer le suivi des décisions du bureau"],
      availability: "Sur rendez-vous via le club",
      contactLabel: "Contacter la gouvernance",
      contactHref: "/contact",
      links: [
        { label: "Organigramme", href: "/le-club/organigramme" },
        { label: "Contact", href: "/contact" }
      ]
    };
  }

  if (normalized.includes("president")) {
    return {
      department: "Présidence",
      bio: "Garant du projet associatif, du cap sportif et de la représentation du club auprès des institutions, partenaires et familles.",
      missions: ["Porter la vision du club", "Représenter l'association", "Arbitrer les priorités stratégiques"],
      availability: "Sur rendez-vous via le club",
      contactLabel: "Contacter la présidence",
      contactHref: "/contact",
      links: [
        { label: "Projet club", href: "/le-club" },
        { label: "Partenariats", href: "/partenaires" }
      ]
    };
  }

  if (normalized.includes("licence") || normalized.includes("inscription")) {
    return {
      department: "Licences",
      bio: "Point d'entrée des familles pour les dossiers administratifs, les renouvellements, les pièces manquantes et le suivi des inscriptions.",
      missions: ["Suivre les licences", "Accompagner les familles", "Contrôler les dossiers administratifs"],
      availability: "Permanence administrative les soirs d'entraînement",
      contactLabel: "Question inscription",
      contactHref: "/inscriptions",
      links: [
        { label: "Inscriptions", href: "/inscriptions" },
        { label: "Espace membre", href: "/espace-membre" }
      ]
    };
  }

  if (normalized.includes("communication")) {
    return {
      department: "Communication",
      bio: "Coordonne les informations publiques du club, les annonces officielles, les supports digitaux et la valorisation des équipes.",
      missions: ["Publier les informations officielles", "Valoriser les équipes", "Coordonner les contenus médias"],
      availability: "Demandes traitées sous 48 h",
      contactLabel: "Transmettre une information",
      contactHref: "/contact",
      links: [
        { label: "Actualités", href: "/actualites" },
        { label: "Médias", href: "/medias" }
      ]
    };
  }

  if (normalized.includes("partenariat")) {
    return {
      department: "Partenariats",
      bio: "Construit les relations avec les entreprises, collectivités et soutiens du territoire pour renforcer les projets du club.",
      missions: ["Accueillir les partenaires", "Construire les offres", "Suivre les engagements"],
      availability: "Rendez-vous partenaires sur demande",
      contactLabel: "Devenir partenaire",
      contactHref: "/partenaires",
      links: [
        { label: "Partenaires", href: "/partenaires" },
        { label: "Contact", href: "/contact" }
      ]
    };
  }

  if (normalized.includes("evenement")) {
    return {
      department: "Événementiel",
      bio: "Organise les temps forts du club, les tournois, les animations et la mobilisation des bénévoles.",
      missions: ["Planifier les événements", "Coordonner les bénévoles", "Sécuriser l'accueil du public"],
      availability: "Disponible avant chaque événement club",
      contactLabel: "Proposer une aide",
      contactHref: "/contact",
      links: [
        { label: "Calendrier", href: "/calendrier" },
        { label: "Contact", href: "/contact" }
      ]
    };
  }

  if (normalized.includes("tresor")) {
    return {
      department: "Finances",
      bio: "Assure le suivi financier, la rigueur budgétaire et la lisibilité des engagements économiques du club.",
      missions: ["Suivre le budget", "Piloter les engagements financiers", "Préparer les bilans"],
      availability: "Sur rendez-vous administratif",
      contactLabel: "Question financière",
      contactHref: "/contact",
      links: [
        { label: "Boutique", href: "/boutique" },
        { label: "Contact", href: "/contact" }
      ]
    };
  }

  if (normalized.includes("secretaire")) {
    return {
      department: "Secrétariat",
      bio: "Structure les échanges officiels, les documents administratifs et le fonctionnement courant de l'association.",
      missions: ["Préparer les documents officiels", "Suivre les réunions", "Centraliser les demandes administratives"],
      availability: "Réponse via le club",
      contactLabel: "Contacter le secrétariat",
      contactHref: "/contact",
      links: [
        { label: "Mentions légales", href: "/mentions-legales" },
        { label: "Contact", href: "/contact" }
      ]
    };
  }

  if (normalized.includes("correspondant")) {
    return {
      department: "Administration & licences",
      bio: "Correspondant officiel du club et interlocuteur des familles pour les licences : créations, renouvellements, pièces administratives et suivi des dossiers.",
      missions: ["Assurer le rôle de correspondant du club", "Suivre les licences et inscriptions", "Accompagner les familles dans leurs démarches"],
      availability: "Permanence administrative les soirs d'entraînement",
      contactLabel: "Question inscription",
      contactHref: "/inscriptions",
      links: [
        { label: "Inscriptions", href: "/inscriptions" },
        { label: "Espace membre", href: "/espace-membre" }
      ]
    };
  }

  if (normalized.includes("arbitre")) {
    return {
      department: "Arbitrage",
      bio: "Référent arbitrage du club, il accompagne les arbitres, veille au respect des règles et fait le lien avec les instances sur les questions d'arbitrage.",
      missions: ["Accompagner les arbitres du club", "Faire le lien avec les instances", "Sensibiliser au respect de l'arbitrage"],
      availability: "Contact via le club",
      contactLabel: "Contacter le club",
      contactHref: "/contact",
      links: [
        { label: "Calendrier", href: "/calendrier" },
        { label: "Contact", href: "/contact" }
      ]
    };
  }

  if (normalized.includes("securite")) {
    return {
      department: "Sécurité",
      bio: "Référent sécurité du club, il veille au bon déroulement et à la sécurité lors des rencontres, manifestations et rassemblements au stade.",
      missions: ["Veiller à la sécurité des rencontres", "Coordonner l'accueil et les accès", "Prévenir les risques lors des manifestations"],
      availability: "Présent les jours de match et d'événement",
      contactLabel: "Contacter le club",
      contactHref: "/contact",
      links: [
        { label: "Stade Henri Longuet", href: "/le-club/stade-henri-longuet" },
        { label: "Contact", href: "/contact" }
      ]
    };
  }

  if (normalized.includes("benevole") || normalized.includes("manifestation")) {
    return {
      department: "Bénévoles & manifestations",
      bio: "Responsable de la mobilisation des bénévoles et de l'organisation des manifestations qui rassemblent licenciés, familles et supporters du club.",
      missions: ["Coordonner les bénévoles", "Organiser les manifestations du club", "Assurer l'accueil du public lors des événements"],
      availability: "Avant chaque événement du club",
      contactLabel: "Aider comme bénévole",
      contactHref: "/contact",
      links: [
        { label: "Calendrier", href: "/calendrier" },
        { label: "Contact", href: "/contact" }
      ]
    };
  }

  if (
    normalized.includes("information") ||
    normalized.includes("numerique") ||
    normalized.includes("informatique") ||
    normalized.includes("digital") ||
    normalized.includes("web")
  ) {
    return {
      department: "Systèmes d'information",
      bio: "Responsable des systèmes d'information et du numérique du club : site officiel, CRM, données, outils digitaux et accompagnement de la formation.",
      missions: ["Développer et maintenir le site du club", "Administrer les systèmes d'information et les données", "Outiller le numérique de la formation"],
      availability: "Disponible en ligne, réponse via le club",
      contactLabel: "Contact numérique",
      contactHref: "/contact",
      links: [
        { label: "Le Club", href: "/le-club" },
        { label: "Contact", href: "/contact" }
      ]
    };
  }

  return {
    department: category === "BUREAU" ? "Bureau exécutif" : "Vie du club",
    bio: "Responsable engagé dans le fonctionnement quotidien du club et l'accompagnement des licenciés, familles et bénévoles.",
    missions: ["Orienter les demandes", "Coordonner son périmètre", "Faire remonter les besoins du terrain"],
    availability: "Contact via le club",
    contactLabel: "Contacter le club",
    contactHref: "/contact",
    links: [
      { label: "Le Club", href: "/le-club" },
      { label: "Contact", href: "/contact" }
    ]
  };
}

function buildOfficial(seed: OfficialProfileSeed): DisplayOfficial {
  return {
    id: seed.id,
    name: seed.name,
    slug: officialSlug(seed.name, seed.id),
    category: seed.category,
    position: seed.position,
    department: seed.department,
    photo: seed.photo ?? null,
    bio: seed.bio,
    missions: seed.missions,
    availability: seed.availability,
    contactLabel: seed.contactLabel ?? "Contacter le club",
    contactHref: seed.contactHref ?? "/contact",
    links: seed.links ?? [{ label: "Contact", href: "/contact" }]
  };
}

function enrichOfficial(id: string, name: string, category: DisplayOfficial["category"], position: string, photo: string | null): DisplayOfficial {
  const profile = inferOfficialProfile(position, category);
  return {
    id,
    name,
    slug: officialSlug(name, id),
    category,
    position,
    photo,
    ...profile
  };
}

// Données officielles du club (bureau statutaire + dirigeants / responsables de pôle).
// Source unique alimentant l'organigramme, ses fiches détail et les pages Bureau/Dirigeants.
const mockOfficials: ClubOfficialsContent = {
  bureau: [
    buildOfficial({
      id: "b1",
      name: "SAGLAM Ferhat",
      category: "BUREAU",
      position: "Président",
      department: "Présidence",
      bio: "Président de l'ES Viry-Châtillon Football, il porte le projet club, représente l'association et veille à la cohérence entre ambition sportive, rôle éducatif et ancrage local.",
      missions: ["Fixer le cap du club", "Représenter l'association", "Coordonner le bureau exécutif", "Développer les relations institutionnelles"],
      availability: "Sur rendez-vous via le secrétariat du club",
      contactLabel: "Contacter la présidence",
      contactHref: "/contact",
      links: [
        { label: "Projet club", href: "/le-club" },
        { label: "Partenariats", href: "/partenaires" }
      ]
    }),
    buildOfficial({
      id: "b2",
      name: "FALL Ousmane",
      category: "BUREAU",
      position: "Vice-président",
      department: "Gouvernance",
      bio: "Bras droit de la présidence, il assure la continuité des décisions du bureau, la coordination interne et le suivi des dossiers transverses du club.",
      missions: ["Seconder la présidence", "Coordonner les responsables de pôle", "Assurer le suivi des décisions du bureau"],
      availability: "Sur rendez-vous via le club",
      contactLabel: "Contacter la gouvernance",
      contactHref: "/contact",
      links: [
        { label: "Organigramme", href: "/le-club/organigramme" },
        { label: "Contact", href: "/contact" }
      ]
    }),
    buildOfficial({
      id: "b3",
      name: "TRAORÉ Laye",
      category: "BUREAU",
      position: "Secrétaire général",
      department: "Secrétariat",
      bio: "Référent administratif du bureau, il structure les documents officiels, les convocations, comptes rendus et la vie statutaire de l'association.",
      missions: ["Gérer les documents officiels", "Préparer les réunions et assemblées", "Centraliser les demandes administratives"],
      availability: "Réponse via le secrétariat du club",
      contactLabel: "Contacter le secrétariat",
      contactHref: "/contact",
      links: [
        { label: "Mentions légales", href: "/mentions-legales" },
        { label: "Contact", href: "/contact" }
      ]
    }),
    buildOfficial({
      id: "b4",
      name: "ABDEDAIM Khaled",
      category: "BUREAU",
      position: "Trésorier",
      department: "Finances",
      bio: "Responsable du suivi financier, il sécurise le budget, les cotisations et la bonne utilisation des ressources du club.",
      missions: ["Piloter le budget", "Suivre les cotisations et paiements", "Préparer les bilans financiers"],
      availability: "Sur rendez-vous administratif",
      contactLabel: "Question financière",
      contactHref: "/contact",
      links: [
        { label: "Boutique", href: "/boutique" },
        { label: "Contact", href: "/contact" }
      ]
    })
  ],
  dirigeants: [
    buildOfficial({
      id: "d1",
      name: "AURÉAL Jean-Pierre",
      category: "DIRIGEANT",
      position: "Correspondant · Responsable administratif et licences",
      department: "Administration & licences",
      bio: "Correspondant officiel du club et interlocuteur des familles pour les licences : créations, renouvellements, pièces administratives et suivi des dossiers.",
      missions: ["Assurer le rôle de correspondant du club", "Suivre les licences et inscriptions", "Accompagner les familles dans leurs démarches"],
      availability: "Permanence administrative les soirs d'entraînement",
      contactLabel: "Question inscription",
      contactHref: "/inscriptions",
      links: [
        { label: "Inscriptions", href: "/inscriptions" },
        { label: "Espace membre", href: "/espace-membre" }
      ]
    }),
    buildOfficial({
      id: "d2",
      name: "LOUGUEAIDI Jawad",
      category: "DIRIGEANT",
      position: "Responsable communication",
      department: "Communication",
      bio: "Coordonne les informations publiques du club, les annonces officielles, les supports digitaux et la valorisation des équipes.",
      missions: ["Publier les informations officielles", "Valoriser les équipes", "Animer les supports digitaux"],
      availability: "Demandes traitées sous 48 h",
      contactLabel: "Transmettre une information",
      contactHref: "/contact",
      links: [
        { label: "Actualités", href: "/actualites" },
        { label: "Médias", href: "/medias" }
      ]
    }),
    buildOfficial({
      id: "d3",
      name: "FOL Stéphane",
      category: "DIRIGEANT",
      position: "Responsable partenariats et sponsoring",
      department: "Partenariats",
      bio: "Développe les relations avec les entreprises et soutiens du territoire, et accompagne les partenaires qui souhaitent s'associer au club.",
      missions: ["Accueillir et fidéliser les partenaires", "Construire les offres de sponsoring", "Suivre les engagements et contreparties"],
      availability: "Rendez-vous partenaires sur demande",
      contactLabel: "Devenir partenaire",
      contactHref: "/partenaires",
      links: [
        { label: "Partenaires", href: "/partenaires" },
        { label: "Contact", href: "/contact" }
      ]
    }),
    buildOfficial({
      id: "d4",
      name: "FRIHI Fouad & CARRIC Cédric",
      category: "DIRIGEANT",
      position: "Responsables bénévoles et manifestations",
      department: "Bénévoles & manifestations",
      bio: "Ils organisent les temps forts du club, les manifestations et mobilisent les bénévoles autour des événements qui rassemblent licenciés et familles.",
      missions: ["Coordonner les bénévoles", "Organiser les manifestations du club", "Assurer l'accueil du public lors des événements"],
      availability: "Avant chaque événement du club",
      contactLabel: "Aider comme bénévole",
      contactHref: "/contact",
      links: [
        { label: "Calendrier", href: "/calendrier" },
        { label: "Contact", href: "/contact" }
      ]
    }),
    buildOfficial({
      id: "d5",
      name: "BOUTANT Jean-Claude",
      category: "DIRIGEANT",
      position: "Référent arbitres",
      department: "Arbitrage",
      bio: "Référent arbitrage du club, il accompagne les arbitres, veille au respect des règles et fait le lien avec les instances sur les questions d'arbitrage.",
      missions: ["Accompagner les arbitres du club", "Faire le lien avec les instances", "Sensibiliser au respect de l'arbitrage"],
      availability: "Contact via le club",
      contactLabel: "Contacter le club",
      contactHref: "/contact",
      links: [
        { label: "Calendrier", href: "/calendrier" },
        { label: "Contact", href: "/contact" }
      ]
    }),
    buildOfficial({
      id: "d6",
      name: "PEREIRA Fernando",
      category: "DIRIGEANT",
      position: "Référent sécurité",
      department: "Sécurité",
      bio: "Référent sécurité du club, il veille au bon déroulement et à la sécurité lors des rencontres, manifestations et rassemblements au stade.",
      missions: ["Veiller à la sécurité des rencontres", "Coordonner l'accueil et les accès", "Prévenir les risques lors des manifestations"],
      availability: "Présent les jours de match et d'événement",
      contactLabel: "Contacter le club",
      contactHref: "/contact",
      links: [
        { label: "Stade Henri Longuet", href: "/le-club/stade-henri-longuet" },
        { label: "Contact", href: "/contact" }
      ]
    }),
    buildOfficial({
      id: "d7",
      name: "BAH Mamadou",
      category: "DIRIGEANT",
      position: "Responsable systèmes d'information & numérique",
      department: "Systèmes d'information",
      bio: "Développeur du site officiel du club, il pilote l'ensemble des systèmes d'information : site, CRM, données, outils numériques et accompagnement digital de la formation.",
      missions: ["Développer et maintenir le site du club", "Administrer les systèmes d'information et les données", "Outiller le numérique de la formation"],
      availability: "Disponible en ligne, réponse via le club",
      contactLabel: "Contact numérique",
      contactHref: "/contact",
      links: [
        { label: "Le Club", href: "/le-club" },
        { label: "Contact", href: "/contact" }
      ]
    })
  ]
};

export async function getClubOfficials(): Promise<ClubOfficialsContent> {
  const rows = await readPublicDb(() => listClubOfficials());
  if (rows && rows.length > 0) {
    const toDisplay = (r: (typeof rows)[number]): DisplayOfficial => enrichOfficial(r.id, r.full_name, r.category, r.position, r.photo_url);
    return {
      bureau: rows.filter((r) => r.category === "BUREAU").map(toDisplay),
      dirigeants: rows.filter((r) => r.category === "DIRIGEANT").map(toDisplay)
    };
  }
  return mockOfficials;
}

/**
 * Adapte une fiche officielle (DisplayOfficial) au format StaffPerson attendu par
 * l'annuaire public (StaffDirectory). Permet aux pages Bureau/Dirigeants de partager
 * la même source de vérité que l'organigramme sans dupliquer les noms.
 */
export function officialToStaffPerson(official: DisplayOfficial, fallbackPhoto: string): StaffPerson {
  return {
    name: official.name,
    role: official.position,
    category: official.department,
    pole: official.department,
    contact: "Via le secrétariat du club",
    photo: official.photo ?? fallbackPhoto,
    tags: official.missions.slice(0, 2)
  };
}

export async function getClubOfficialBySlug(slug: string): Promise<DisplayOfficial | null> {
  const officials = await getClubOfficials();
  return [...officials.bureau, ...officials.dirigeants].find((official) => official.slug === slug) ?? null;
}
