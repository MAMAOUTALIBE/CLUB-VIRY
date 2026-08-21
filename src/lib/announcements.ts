export type AnnouncementType = "info" | "important" | "urgent";
export type SiteAnnouncement = { id: string; message: string; type: AnnouncementType; linkLabel: string; linkHref: string; active: boolean; startAt: string; endAt: string; priority: number };
export type AnnouncementIssue = { field: string; message: string };
export type AnnouncementValidation = { ok: true; announcements: SiteAnnouncement[] } | { ok: false; issues: AnnouncementIssue[] };

const types = new Set<AnnouncementType>(["info", "important", "urgent"]);

export function isSafeAnnouncementLink(value: string): boolean {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

export function validateAnnouncementsSetting(body: unknown): AnnouncementValidation {
  const issues: AnnouncementIssue[] = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, issues: [{ field: "announcements", message: "Un objet est attendu." }] };
  if (Object.keys(body).some((key) => key !== "items")) issues.push({ field: "announcements", message: "Seul le champ items est autorisé." });
  const rawItems = (body as Record<string, unknown>).items;
  if (!Array.isArray(rawItems)) return { ok: false, issues: [{ field: "items", message: "Une liste d’annonces est attendue." }] };
  if (rawItems.length > 20) issues.push({ field: "items", message: "20 annonces maximum." });
  const ids = new Set<string>();
  const items: SiteAnnouncement[] = [];
  const allowed = new Set(["id", "message", "type", "linkLabel", "linkHref", "active", "startAt", "endAt", "priority"]);
  rawItems.forEach((raw, index) => {
    const field = `items.${index}`;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) { issues.push({ field, message: "L’annonce doit être un objet." }); return; }
    const item = raw as Record<string, unknown>;
    if (Object.keys(item).some((key) => !allowed.has(key))) issues.push({ field, message: "L’annonce contient un champ inconnu." });
    for (const key of ["id", "message", "type", "linkLabel", "linkHref", "startAt", "endAt"] as const) if (typeof item[key] !== "string") issues.push({ field: `${field}.${key}`, message: "Une chaîne de caractères est attendue." });
    if (typeof item.active !== "boolean") issues.push({ field: `${field}.active`, message: "Un booléen est attendu." });
    if (typeof item.priority !== "number" || !Number.isInteger(item.priority)) issues.push({ field: `${field}.priority`, message: "Un nombre entier est attendu." });
    if (issues.some((issue) => issue.field.startsWith(`${field}.`))) return;
    const normalized = { ...(item as SiteAnnouncement), id: String(item.id).trim(), message: String(item.message).trim(), type: String(item.type).trim() as AnnouncementType, linkLabel: String(item.linkLabel).trim(), linkHref: String(item.linkHref).trim(), startAt: String(item.startAt).trim(), endAt: String(item.endAt).trim() };
    if (!normalized.id) issues.push({ field: `${field}.id`, message: "Identifiant requis." }); else if (ids.has(normalized.id)) issues.push({ field: `${field}.id`, message: "Chaque identifiant doit être unique." }); else ids.add(normalized.id);
    if (!normalized.message) issues.push({ field: `${field}.message`, message: "Message requis." }); else if (normalized.message.length > 280) issues.push({ field: `${field}.message`, message: "280 caractères maximum." });
    if (!types.has(normalized.type)) issues.push({ field: `${field}.type`, message: "Type attendu : info, important ou urgent." });
    if (normalized.linkLabel.length > 60) issues.push({ field: `${field}.linkLabel`, message: "60 caractères maximum." });
    if (normalized.linkHref.length > 1500 || !isSafeAnnouncementLink(normalized.linkHref)) issues.push({ field: `${field}.linkHref`, message: "Utilisez un chemin interne /… ou une URL HTTPS." });
    if ((normalized.linkLabel && !normalized.linkHref) || (!normalized.linkLabel && normalized.linkHref)) issues.push({ field: `${field}.linkLabel`, message: "Le libellé et le lien doivent être renseignés ensemble." });
    if (normalized.priority < 0 || normalized.priority > 100) issues.push({ field: `${field}.priority`, message: "La priorité doit être comprise entre 0 et 100." });
    const start = normalized.startAt ? new Date(normalized.startAt).getTime() : null;
    const end = normalized.endAt ? new Date(normalized.endAt).getTime() : null;
    if (start !== null && Number.isNaN(start)) issues.push({ field: `${field}.startAt`, message: "Date de début invalide." });
    if (end !== null && Number.isNaN(end)) issues.push({ field: `${field}.endAt`, message: "Date de fin invalide." });
    if (start !== null && end !== null && !Number.isNaN(start) && !Number.isNaN(end) && start > end) issues.push({ field: `${field}.endAt`, message: "La fin doit être postérieure au début." });
    items.push(normalized);
  });
  return issues.length ? { ok: false, issues } : { ok: true, announcements: items };
}

export function getVisibleAnnouncements(configured: SiteAnnouncement[] | null, now = Date.now()): SiteAnnouncement[] {
  if (!configured) return [];
  return configured.map((item, order) => ({ item, order })).filter(({ item }) => {
    const start = item.startAt ? new Date(item.startAt).getTime() : null;
    const end = item.endAt ? new Date(item.endAt).getTime() : null;
    return item.active && (start === null || start <= now) && (end === null || end >= now);
  }).sort((a, b) => b.item.priority - a.item.priority || a.order - b.order).map(({ item }) => item);
}
