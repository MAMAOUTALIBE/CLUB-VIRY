export type MobileMatchFeedRow = {
  id: string;
  opponent_name: string;
  opponent_logo_url: string | null;
  location: "HOME" | "AWAY" | "NEUTRAL";
  starts_at: string;
  competition: string | null;
  status: "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED" | "CANCELLED";
  home_score: number | null;
  away_score: number | null;
  live_minute: number | null;
  teams: { name: string } | null;
};

export type MobileMatchCard = {
  id: string;
  category: string;
  competition: string | null;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  minute: number | null;
  homeLogoUrl: string | null;
  awayLogoUrl: string | null;
};

export type MatchIdentity = Pick<MobileMatchCard, "category" | "home" | "away" | "homeLogoUrl" | "awayLogoUrl">;

export function mapMatchIdentity(row: MobileMatchFeedRow): MatchIdentity | null {
  const teamName = row.teams?.name.trim();
  const opponentName = row.opponent_name.trim();
  if (!teamName || !opponentName) return null;
  const away = row.location === "AWAY";
  return {
    category: teamName,
    // En terrain neutre, la structure CRM ne porte aucun tirage de côté :
    // on conserve donc l'équipe rattachée en premier, comme pour HOME.
    home: away ? opponentName : teamName,
    away: away ? teamName : opponentName,
    homeLogoUrl: away ? row.opponent_logo_url : null,
    awayLogoUrl: away ? null : row.opponent_logo_url
  };
}

function toCard(row: MobileMatchFeedRow): MobileMatchCard | null {
  const identity = mapMatchIdentity(row);
  if (row.home_score === null || row.away_score === null || !identity) return null;
  return {
    id: row.id,
    category: identity.category,
    competition: row.competition,
    home: identity.home,
    away: identity.away,
    homeScore: row.home_score,
    awayScore: row.away_score,
    minute: row.live_minute,
    // Le CRM ne possède pas de champ logo pour l'équipe du club. On ne détourne
    // pas la photo de couverture et on n'invente aucun écusson.
    homeLogoUrl: identity.homeLogoUrl,
    awayLogoUrl: identity.awayLogoUrl
  };
}

export function selectMobileMatchFeed(rows: MobileMatchFeedRow[]): { live: MobileMatchCard | null; results: MobileMatchCard[] } {
  const ordered = [...rows].sort((a, b) => Date.parse(b.starts_at) - Date.parse(a.starts_at));
  const liveRow = ordered.find((row) => row.status === "LIVE" && row.live_minute !== null && row.home_score !== null && row.away_score !== null);
  const live = liveRow ? toCard(liveRow) : null;
  const results = ordered
    .filter((row) => row.status === "FINISHED" && row.home_score !== null && row.away_score !== null)
    .map(toCard)
    .filter((row): row is MobileMatchCard => row !== null)
    .slice(0, 2);
  return { live, results };
}
