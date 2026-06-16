import "server-only";

import { listMatches } from "@/lib/db/teams";
import type { Match, MatchLocation } from "@/lib/db/types";
import { getFallbackRecentResults } from "@/lib/public-fallbacks";
import { readPublicDb } from "@/lib/public-db";

const clubName = "ES Viry-Châtillon";

export type ResultDisplayItem = {
  id: string;
  competition: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  dateLabel: string;
  place: string;
};

export type ResultsPageData = {
  items: ResultDisplayItem[];
  isFallback: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  weekday: "short",
  year: "numeric"
});

function getTeams(location: MatchLocation, opponentName: string) {
  if (location === "AWAY") {
    return { home: opponentName, away: clubName };
  }

  return { home: clubName, away: opponentName };
}

function isFinishedMatch(match: Match) {
  return match.status === "FINISHED" && match.home_score !== null && match.away_score !== null;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date à confirmer";
  }

  const label = dateFormatter.format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function toDisplay(match: Match): ResultDisplayItem {
  const teams = getTeams(match.location, match.opponent_name);
  return {
    id: match.id,
    competition: match.competition ?? "Match officiel",
    home: teams.home,
    away: teams.away,
    homeScore: match.home_score ?? 0,
    awayScore: match.away_score ?? 0,
    dateLabel: formatDate(match.starts_at),
    place: match.venue ?? "Lieu à confirmer"
  };
}

export async function getResultsPageData(): Promise<ResultsPageData> {
  const rows = await readPublicDb(() => listMatches(80));
  const finished = (rows ?? [])
    .filter(isFinishedMatch)
    .sort((left, right) => new Date(right.starts_at).getTime() - new Date(left.starts_at).getTime());

  if (finished.length > 0) {
    return { items: finished.map(toDisplay), isFallback: false };
  }

  return { items: getFallbackRecentResults().map(toDisplay), isFallback: true };
}
