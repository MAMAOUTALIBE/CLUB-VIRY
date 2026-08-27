export type HomeHeroSlide = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonLabel: string;
  buttonHref: string;
  active: boolean;
  startAt: string;
  endAt: string;
  objectPosition?: string;
};

export type HeroValidationIssue = { field: string; message: string };
export type HeroValidationResult = { ok: true; slides: HomeHeroSlide[] } | { ok: false; issues: HeroValidationIssue[] };

const MAX_SLIDES = 12;
const limits = { id: 80, title: 120, description: 500, imageUrl: 1500, buttonLabel: 60, buttonHref: 1500 } as const;

const PUBLIC_HERO_ROUTES = new Set([
  "/",
  "/academy",
  "/actualites",
  "/boutique",
  "/boutique/conditions-generales",
  "/boutique/livraison-retour",
  "/calendrier",
  "/connexion",
  "/contact",
  "/detections-recrutement",
  "/equipes",
  "/espace-membre",
  "/formation",
  "/formation/ecole-de-foot",
  "/formation/football-a-11",
  "/formation/projet-ecole-de-foot",
  "/formation/stages",
  "/inscriptions",
  "/le-club",
  "/le-club/codes-de-conduite",
  "/le-club/encadrement",
  "/le-club/entraineurs",
  "/le-club/galerie",
  "/le-club/histoire",
  "/le-club/infrastructures",
  "/le-club/installations",
  "/le-club/mot-du-president",
  "/le-club/organigramme",
  "/le-club/stade-henri-longuet",
  "/le-club/valeurs-partenaires",
  "/medias",
  "/mentions-legales",
  "/partenaires",
  "/plan-du-site",
  "/politique-confidentialite",
  "/resultats"
]);

const PUBLIC_HERO_DYNAMIC_ROUTES = [
  /^\/actualites\/[a-z0-9]+(?:-[a-z0-9]+)*$/,
  /^\/matchs\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  /^\/equipes\/[a-z0-9]+(?:-[a-z0-9]+)*$/,
  /^\/le-club\/encadrement\/[a-z0-9]+(?:-[a-z0-9]+)*$/,
  /^\/le-club\/organigramme\/[a-z0-9]+(?:-[a-z0-9]+)*$/
];

const PUBLIC_HERO_ANCHORS: Readonly<Record<string, ReadonlySet<string>>> = {
  "/academy": new Set(["projet", "entraineurs", "encadrement", "ecole-de-foot", "football-a-11", "stages", "formations"]),
  "/le-club/infrastructures": new Set(["installations", "stade-henri-longuet"]),
  "/le-club/organigramme": new Set(["bureau", "dirigeants"]),
  "/le-club/valeurs-partenaires": new Set(["valeurs", "partenaires", "devenir-partenaire"])
};

export function isAllowedHeroImageUrl(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "images.unsplash.com" || url.hostname.endsWith(".supabase.co"));
  } catch {
    return false;
  }
}

export function isSafeHeroLink(value: string): boolean {
  if (!value || value === "#" || value.startsWith("#")) return false;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) {
    try {
      const url = new URL(value, "https://www.esviry-chatillon.fr");
      if (url.origin !== "https://www.esviry-chatillon.fr" || url.username || url.password) return false;
      const routeExists = PUBLIC_HERO_ROUTES.has(url.pathname) || PUBLIC_HERO_DYNAMIC_ROUTES.some((route) => route.test(url.pathname));
      if (!routeExists) return false;
      if (!url.hash) return true;
      return PUBLIC_HERO_ANCHORS[url.pathname]?.has(decodeURIComponent(url.hash.slice(1))) ?? false;
    } catch {
      return false;
    }
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function validateHomeHeroSetting(body: unknown): HeroValidationResult {
  const issues: HeroValidationIssue[] = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, issues: [{ field: "home_hero", message: "Un objet est attendu." }] };
  const rootKeys = Object.keys(body);
  if (rootKeys.some((key) => key !== "slides")) issues.push({ field: "home_hero", message: "Seul le champ slides est autorisé." });
  const rawSlides = (body as Record<string, unknown>).slides;
  if (!Array.isArray(rawSlides)) return { ok: false, issues: [{ field: "slides", message: "Une liste de diapositives est attendue." }] };
  if (rawSlides.length < 1 || rawSlides.length > MAX_SLIDES) return { ok: false, issues: [{ field: "slides", message: `Entre 1 et ${MAX_SLIDES} diapositives sont requises.` }] };
  const ids = new Set<string>();
  const slides: HomeHeroSlide[] = [];
  rawSlides.forEach((raw, index) => {
    const field = `slides.${index}`;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) { issues.push({ field, message: "La diapositive doit être un objet." }); return; }
    const item = raw as Record<string, unknown>;
    const allowedFields = new Set(["id", "title", "description", "imageUrl", "buttonLabel", "buttonHref", "active", "startAt", "endAt"]);
    if (Object.keys(item).some((key) => !allowedFields.has(key))) issues.push({ field, message: "La diapositive contient un champ inconnu." });
    for (const key of ["id", "title", "description", "imageUrl", "buttonLabel", "buttonHref", "startAt", "endAt"] as const) {
      if (typeof item[key] !== "string") issues.push({ field: `${field}.${key}`, message: "Une chaîne de caractères est attendue." });
    }
    if (typeof item.active !== "boolean") issues.push({ field: `${field}.active`, message: "Un booléen est attendu." });
    if (issues.some((issue) => issue.field.startsWith(`${field}.`))) return;
    const slide = item as HomeHeroSlide;
    const normalized = { ...slide, id: slide.id.trim(), title: slide.title.trim(), description: slide.description.trim(), imageUrl: slide.imageUrl.trim(), buttonLabel: slide.buttonLabel.trim(), buttonHref: slide.buttonHref.trim(), startAt: slide.startAt.trim(), endAt: slide.endAt.trim() };
    if (!normalized.id) issues.push({ field: `${field}.id`, message: "Identifiant requis." });
    else if (ids.has(normalized.id)) issues.push({ field: `${field}.id`, message: "Chaque identifiant doit être unique." }); else ids.add(normalized.id);
    if (!normalized.title) issues.push({ field: `${field}.title`, message: "Titre requis." });
    if (!normalized.imageUrl) issues.push({ field: `${field}.imageUrl`, message: "Image requise." });
    else if (!isAllowedHeroImageUrl(normalized.imageUrl)) issues.push({ field: `${field}.imageUrl`, message: "Utilisez un chemin local /…, images.unsplash.com ou un domaine *.supabase.co." });
    if (!isSafeHeroLink(normalized.buttonHref)) issues.push({ field: `${field}.buttonHref`, message: "Utilisez une route publique existante (et, le cas échéant, une ancre existante) ou une URL HTTPS." });
    for (const key of Object.keys(limits) as Array<keyof typeof limits>) if (normalized[key].length > limits[key]) issues.push({ field: `${field}.${key}`, message: `${limits[key]} caractères maximum.` });
    const start = normalized.startAt ? new Date(normalized.startAt).getTime() : null;
    const end = normalized.endAt ? new Date(normalized.endAt).getTime() : null;
    if (start !== null && Number.isNaN(start)) issues.push({ field: `${field}.startAt`, message: "Date de début invalide." });
    if (end !== null && Number.isNaN(end)) issues.push({ field: `${field}.endAt`, message: "Date de fin invalide." });
    if (start !== null && end !== null && !Number.isNaN(start) && !Number.isNaN(end) && start > end) issues.push({ field: `${field}.endAt`, message: "La fin doit être postérieure au début." });
    slides.push(normalized);
  });
  return issues.length ? { ok: false, issues } : { ok: true, slides };
}

export function getVisibleHeroSlides(configured: HomeHeroSlide[] | null, fallback: HomeHeroSlide[], now = Date.now()): HomeHeroSlide[] {
  if (!configured) return fallback;
  const visible = configured.filter((slide) => {
    const start = slide.startAt ? new Date(slide.startAt).getTime() : null;
    const end = slide.endAt ? new Date(slide.endAt).getTime() : null;
    return slide.active && (start === null || start <= now) && (end === null || end >= now);
  });
  return visible.length > 0 ? visible : fallback;
}
