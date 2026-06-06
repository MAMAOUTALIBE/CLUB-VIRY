import type { NextRequest } from "next/server";

import { getEducatorContext } from "@/lib/api/educator-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminMatchPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { createMatchForEducator } from "@/lib/db/teams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const educator = await getEducatorContext(request);

  if (!educator.ok) {
    return educator.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminMatchPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Match invalide.", payload.issues);
  }

  if (!payload.data.teamId) {
    return jsonError(400, "VALIDATION_ERROR", "Une equipe est obligatoire pour creer un match educateur.", [
      { field: "teamId", message: "Identifiant equipe obligatoire." }
    ]);
  }

  try {
    const match = await createMatchForEducator(educator.context.user.id, educator.context.canManageAllTeams, payload.data);

    if (!match) {
      return jsonError(404, "NOT_FOUND", "Equipe introuvable ou non autorisee.");
    }

    await recordActivity({
      actorId: educator.context.user.id,
      action: "educator.match.created",
      entityType: "matches",
      entityId: match.id,
      metadata: {
        teamId: match.team_id,
        opponentName: match.opponent_name,
        startsAt: match.starts_at
      }
    });

    return jsonOk({ match }, 201);
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur creation match educateur inconnue.");
  }
}
