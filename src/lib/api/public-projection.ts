import type { ClubEvent, Match } from "@/lib/db/types";

/**
 * Projection publique des matchs et evenements.
 *
 * `/api/matches` et `/api/calendar` sont ouverts sans authentification. Les requetes
 * sous-jacentes font un `select("*")` : elles renvoyaient donc aussi les colonnes de
 * travail interne — `notes` (commentaires libres saisis dans le CRM), `educator_id`,
 * `created_by`, `deleted_by`, `season_id`. Meme regle que l'espace educateur, qui
 * projette deja explicitement ce qu'il expose : on ne sort que ce qu'une page publique
 * affiche reellement.
 */
export type PublicMatch = Pick<
  Match,
  | "id"
  | "team_id"
  | "category_id"
  | "title"
  | "group_label"
  | "pitch_code"
  | "opponent_name"
  | "opponent_logo_url"
  | "location"
  | "starts_at"
  | "ends_at"
  | "venue"
  | "competition"
  | "status"
  | "home_score"
  | "away_score"
  | "live_minute"
  | "follow_url"
>;

export type PublicEvent = Pick<
  ClubEvent,
  | "id"
  | "team_id"
  | "category_id"
  | "title"
  | "group_label"
  | "pitch_code"
  | "opponent_name"
  | "type"
  | "starts_at"
  | "ends_at"
  | "venue"
  | "description"
  | "status"
  | "is_featured"
>;

export function toPublicMatch(match: Match): PublicMatch {
  return {
    id: match.id,
    team_id: match.team_id,
    category_id: match.category_id,
    title: match.title,
    group_label: match.group_label,
    pitch_code: match.pitch_code,
    opponent_name: match.opponent_name,
    opponent_logo_url: match.opponent_logo_url,
    location: match.location,
    starts_at: match.starts_at,
    ends_at: match.ends_at,
    venue: match.venue,
    competition: match.competition,
    status: match.status,
    home_score: match.home_score,
    away_score: match.away_score,
    live_minute: match.live_minute,
    follow_url: match.follow_url
  };
}

export function toPublicEvent(event: ClubEvent): PublicEvent {
  return {
    id: event.id,
    team_id: event.team_id,
    category_id: event.category_id,
    title: event.title,
    group_label: event.group_label,
    pitch_code: event.pitch_code,
    opponent_name: event.opponent_name,
    type: event.type,
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    venue: event.venue,
    description: event.description,
    status: event.status,
    is_featured: event.is_featured
  };
}
