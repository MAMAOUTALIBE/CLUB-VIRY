import type { CalendarDisplayItem } from "./calendar-view";

export type DailyProgramBadge = "Entraînement" | "Match" | "Terminé" | "Annulé";
export type DailyProgramItem = CalendarDisplayItem & { badge: DailyProgramBadge; showScore: boolean };

const parisDayFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" });

export function getParisCivilDay(value: Date | string): string | null {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  const parts = parisDayFormatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  const year = part("year"); const month = part("month"); const day = part("day");
  return year && month && day ? `${year}-${month}-${day}` : null;
}

export function selectDailyProgramItems(items: CalendarDisplayItem[], now: Date): DailyProgramItem[] {
  const today = getParisCivilDay(now);
  if (!today) return [];
  return items
    .filter((item) => item.startsAt && getParisCivilDay(item.startsAt) === today)
    .filter((item) => item.kind === "match" || item.eventType === "TRAINING")
    .map((item): DailyProgramItem => {
      const cancelled = item.status === "CANCELLED";
      const finished = item.kind === "match" && item.status === "FINISHED";
      return {
        ...item,
        badge: cancelled ? "Annulé" : item.kind === "event" ? "Entraînement" : finished ? "Terminé" : "Match",
        showScore: finished && item.homeScore != null && item.awayScore != null
      };
    })
    .sort((a, b) => new Date(a.startsAt!).getTime() - new Date(b.startsAt!).getTime());
}

export function formatParisToday(now: Date): string {
  const label = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);
  return label.charAt(0).toUpperCase() + label.slice(1);
}
