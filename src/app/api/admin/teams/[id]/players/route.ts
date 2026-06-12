import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminTeamPlayerPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { assignTeamPlayer, getEducatorTeamRoster } from "@/lib/db/teams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "teams:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  try {
    const roster = await getEducatorTeamRoster(id, admin.context.user.id, true);

    if (!roster) {
      return jsonError(404, "NOT_FOUND", "Equipe introuvable.");
    }

    // Ne renvoyer au client QUE les champs joueur necessaires a l'editeur d'effectif
    // (jamais license_number / medical_notes / birth_date / family_id / profile_id : protection PII).
    const players = roster.players.map((entry) => ({
      assignment: entry.assignment,
      player: entry.player ? { id: entry.player.id, first_name: entry.player.first_name, last_name: entry.player.last_name } : null
    }));

    return jsonOk({ team: roster.team, players });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur joueurs equipe inconnue.");
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "teams:manage");

  if (!admin.ok) {
    return admin.response;
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
    const assignment = await assignTeamPlayer(id, payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "team.player.assigned",
      entityType: "team_players",
      entityId: payload.data.playerId,
      metadata: { teamId: id, playerId: payload.data.playerId, shirtNumber: assignment.shirt_number }
    });

    return jsonOk({ assignment }, 201);
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur affectation joueur equipe inconnue.");
  }
}
