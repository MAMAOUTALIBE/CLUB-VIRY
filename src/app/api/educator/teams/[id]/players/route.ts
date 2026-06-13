import type { NextRequest } from "next/server";

import { getEducatorContext } from "@/lib/api/educator-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminTeamPlayerPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { assignTeamPlayerForEducator, getEducatorTeamRoster } from "@/lib/db/teams";

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
    return handleDbError("educator/teams/[id]/players", error);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const educator = await getEducatorContext(request);

  if (!educator.ok) {
    return educator.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminTeamPlayerPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Joueur equipe invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const assignment = await assignTeamPlayerForEducator(id, educator.context.user.id, educator.context.canManageAllTeams, payload.data);

    if (!assignment) {
      return jsonError(404, "NOT_FOUND", "Equipe introuvable ou non autorisee.");
    }

    await recordActivity({
      actorId: educator.context.user.id,
      action: "educator.player.assigned",
      entityType: "team_players",
      entityId: payload.data.playerId,
      metadata: { teamId: id, playerId: payload.data.playerId, shirtNumber: assignment.shirt_number }
    });

    return jsonOk({ assignment }, 201);
  } catch (error) {
    return handleDbError("educator/teams/[id]/players", error);
  }
}
