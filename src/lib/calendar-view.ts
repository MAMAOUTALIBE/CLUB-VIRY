import { matches as fallbackMatches } from "./data";
import { listPublicCalendar } from "./db/calendar";
import type { ClubEvent, ClubEventType, Match, MatchLocation, MatchStatus } from "./db/types";
import { readPublicDb } from "./public-db";

export type CalendarDisplayItem = {
  id: string;
  kind: "match" | "event";
  eyebrow: string;
  title: string;
  home?: string;
  away?: string;
  dateLabel: string;
  timeLabel: string;
  place: string;
  dayOfMonth?: number;
  startsAt?: string;
};

export type CalendarPageData = {
  featured: CalendarDisplayItem;
  items: CalendarDisplayItem[];
  highlightedDays: number[];
  monthTitle: string;
  year: number;
  month: number;
  isFallback: boolean;
};

const clubName = "ES Viry-Châtillon";

const eventTypeLabels: Record<ClubEventType, string> = {
  TRAINING: "Entraînement",
  MEETING: "Réunion",
  TOURNAMENT: "Tournoi",
  CLUB_EVENT: "Événement club",
  DEADLINE: "Échéance",
  OTHER: "Rendez-vous"
};

const matchStatusLabels: Record<MatchStatus, string> = {
  SCHEDULED: "Match officiel",
  LIVE: "En direct",
  FINISHED: "Terminé",
  POSTPONED: "Reporté",
  CANCELLED: "Annulé"
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  weekday: "short"
});

const monthFormatter = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric"
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit"
});

function readDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateLabel(value?: string) {
  const date = readDate(value);
  return date ? dateFormatter.format(date) : "Date à confirmer";
}

function formatTimeLabel(value?: string) {
  const date = readDate(value);
  return date ? timeFormatter.format(date).replace(":", "h") : "Horaire à confirmer";
}

function dayFromLabel(value: string) {
  const match = value.match(/\d{1,2}/);
  return match ? Number(match[0]) : undefined;
}

function getReferenceMonth(items: CalendarDisplayItem[]) {
  const firstDatedItem = items.find((item) => item.startsAt);
  // À défaut de date réelle (mode vitrine sans Supabase), on affiche le mois courant.
  const date = readDate(firstDatedItem?.startsAt) ?? new Date();
  return { year: date.getFullYear(), month: date.getMonth() };
}

function formatMonthTitle(year: number, month: number) {
  const label = monthFormatter.format(new Date(year, month, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getMatchTeams(location: MatchLocation, opponentName: string) {
  if (location === "AWAY") {
    return { home: opponentName, away: clubName };
  }

  return { home: clubName, away: opponentName };
}

export function calendarApiToItems(data: { events?: ClubEvent[]; matches?: Match[] }): CalendarDisplayItem[] {
  const matchItems = (data.matches ?? []).map((match): CalendarDisplayItem => {
    const teams = getMatchTeams(match.location, match.opponent_name);
    const date = readDate(match.starts_at);

    return {
      id: match.id,
      kind: "match",
      eyebrow: matchStatusLabels[match.status],
      title: match.competition ?? "Match officiel",
      home: teams.home,
      away: teams.away,
      dateLabel: formatDateLabel(match.starts_at),
      timeLabel: formatTimeLabel(match.starts_at),
      place: match.venue ?? "Lieu à confirmer",
      dayOfMonth: date?.getDate(),
      startsAt: match.starts_at
    };
  });

  const eventItems = (data.events ?? []).map((event): CalendarDisplayItem => {
    const date = readDate(event.starts_at);

    return {
      id: event.id,
      kind: "event",
      eyebrow: eventTypeLabels[event.type],
      title: event.title,
      dateLabel: formatDateLabel(event.starts_at),
      timeLabel: formatTimeLabel(event.starts_at),
      place: event.venue ?? "Lieu à confirmer",
      dayOfMonth: date?.getDate(),
      startsAt: event.starts_at
    };
  });

  return [...matchItems, ...eventItems].sort((left, right) => {
    const leftTime = readDate(left.startsAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const rightTime = readDate(right.startsAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return leftTime - rightTime;
  });
}

export function getFallbackCalendarItems(): CalendarDisplayItem[] {
  return fallbackMatches.map((match, index) => ({
    id: `fallback-${index}`,
    kind: "match",
    eyebrow: "Match officiel",
    title: match.team,
    home: match.home,
    away: match.away,
    dateLabel: match.date,
    timeLabel: match.time,
    place: match.place,
    dayOfMonth: dayFromLabel(match.date)
  }));
}

export function buildCalendarPageData(items: CalendarDisplayItem[], isFallback: boolean): CalendarPageData {
  const fallbackItems = getFallbackCalendarItems();
  const calendarItems = items.length > 0 ? items : fallbackItems;

  const { year, month } = getReferenceMonth(calendarItems);

  // Ne surligner que les jours d'items réellement datés DANS le mois/année affichés.
  // Sans ce filtre, le numéro de jour d'un item d'un autre mois (ex. un match le
  // 15 juillet) surlignait le « 15 » de la grille de juin — les numéros de jour
  // étant confondus d'un mois à l'autre.
  const highlightedDays = Array.from(
    new Set(
      calendarItems
        .map((item) => {
          const date = readDate(item.startsAt);
          return date && date.getFullYear() === year && date.getMonth() === month ? date.getDate() : undefined;
        })
        .filter((day): day is number => Boolean(day))
    )
  );

  return {
    featured: calendarItems[0],
    items: calendarItems,
    highlightedDays,
    monthTitle: formatMonthTitle(year, month),
    year,
    month,
    isFallback
  };
}

export async function getCalendarPageData(): Promise<CalendarPageData> {
  const calendar = await readPublicDb(() => listPublicCalendar({ limit: 40 }));

  if (calendar && (calendar.events.length > 0 || calendar.matches.length > 0)) {
    return buildCalendarPageData(calendarApiToItems(calendar), false);
  }

  return buildCalendarPageData([], true);
}
