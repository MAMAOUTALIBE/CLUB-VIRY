import type { NextRequest } from "next/server";

import { getEducatorContext } from "@/lib/api/educator-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { getEducatorTeamRoster } from "@/lib/db/teams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const educator = await getEducatorContext(request);

  if (!educator.ok) {
    return educator.response;
  }

  const { id } = await context.params;

  try {
    const roster = await getEducatorTeamRoster(id, educator.context.user.id, educator.context.canManageAllTeams);

    if (!roster) {
      return jsonError(404, "NOT_FOUND", "Equipe introuvable ou non autorisee.");
    }

    // Ne renvoyer au client QUE les champs necessaires a l'espace educateur V1.
    // - Joueurs : jamais license_number / medical_notes / birth_date / family_id / profile_id (PII).
    // - Staff : pas de profile_id (id de compte d'un autre educateur).
    // - Matchs : pas de notes internes ni de season_id.
    const players = roster.players.map((entry) => ({
      assignment: entry.assignment,
      player: entry.player ? { id: entry.player.id, first_name: entry.player.first_name, last_name: entry.player.last_name } : null
    }));
    const staff = roster.staff.map((s) => ({ id: s.id, display_name: s.display_name, role_title: s.role_title, is_head_coach: s.is_head_coach }));
    const matches = roster.matches.map((m) => ({
      id: m.id,
      opponent_name: m.opponent_name,
      starts_at: m.starts_at,
      location: m.location,
      status: m.status,
      home_score: m.home_score,
      away_score: m.away_score,
      competition: m.competition
    }));

    return jsonOk({ team: roster.team, staff, matches, players });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur effectif educateur inconnue.");
  }
}
