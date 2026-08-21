export type PublicationActivityPoint = { date: string; count: number };
const PARIS_ZONE = "Europe/Paris";
const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: PARIS_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const offsetFormatter = new Intl.DateTimeFormat("en-GB", { timeZone: PARIS_ZONE, timeZoneName: "longOffset" });

function parts(date: Date) {
  const values = Object.fromEntries(dateFormatter.formatToParts(date).map((part) => [part.type, part.value]));
  return { year: Number(values.year), month: Number(values.month), day: Number(values.day) };
}
function key(year: number, month: number, day: number) { return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`; }
export function shiftParisDateKey(dateKey: string, days: number) { const [year, month, day] = dateKey.split("-").map(Number); const shifted = new Date(Date.UTC(year, month - 1, day + days)); return key(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate()); }
function parisMidnightUtc(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day, 12));
  const zoneName = offsetFormatter.formatToParts(probe).find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = zoneName.match(/GMT([+-])(\d{2}):(\d{2})/);
  const offsetMinutes = match ? (match[1] === "+" ? 1 : -1) * (Number(match[2]) * 60 + Number(match[3])) : 0;
  return new Date(Date.UTC(year, month - 1, day) - offsetMinutes * 60_000);
}

export function parisDateKey(date: Date): string { const value = parts(date); return key(value.year, value.month, value.day); }
export function getPublicationActivityWindow(now = new Date()) {
  const today = parisDateKey(now), first = shiftParisDateKey(today, -29), afterLast = shiftParisDateKey(today, 1);
  return { startIso: parisMidnightUtc(first).toISOString(), endExclusiveIso: parisMidnightUtc(afterLast).toISOString(), dateKeys: Array.from({ length: 30 }, (_, index) => shiftParisDateKey(first, index)) };
}
export function getParisWeekWindow(now = new Date()) {
  const today = parisDateKey(now); const [year, month, day] = today.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const first = shiftParisDateKey(today, -((weekday + 6) % 7)); const afterLast = shiftParisDateKey(first, 7);
  return { startIso: parisMidnightUtc(first).toISOString(), endExclusiveIso: parisMidnightUtc(afterLast).toISOString() };
}
export function parisWeekDateKeys(fromIso: string): string[] { const first = parisDateKey(new Date(fromIso)); return Array.from({ length: 7 }, (_, index) => shiftParisDateKey(first, index)); }
export function effectivePublicationTimestamps(rows: readonly { published_at: string | null; created_at: string; id?: string }[]): string[] {
  const seen = new Set<string>(); const timestamps: string[] = [];
  for (const row of rows) { const identity = row.id ?? `${row.published_at ?? "null"}:${row.created_at}`; if (seen.has(identity)) continue; seen.add(identity); timestamps.push(row.published_at ?? row.created_at); }
  return timestamps;
}
export function dedupeRowsById<T extends { id: string }>(rows: readonly T[]): T[] {
  const seen = new Set<string>(); return rows.filter((row) => { if (seen.has(row.id)) return false; seen.add(row.id); return true; });
}
export function bucketPublicationActivity(timestamps: readonly string[], now = new Date()): PublicationActivityPoint[] {
  const window = getPublicationActivityWindow(now); const counts = new Map(window.dateKeys.map((date) => [date, 0]));
  for (const timestamp of timestamps) { const parsed = new Date(timestamp); if (Number.isNaN(parsed.getTime())) continue; const date = parisDateKey(parsed); if (counts.has(date)) counts.set(date, (counts.get(date) ?? 0) + 1); }
  return window.dateKeys.map((date) => ({ date, count: counts.get(date) ?? 0 }));
}
