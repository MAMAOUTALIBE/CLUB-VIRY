import type { NextRequest } from "next/server";

import { getEducatorContext } from "@/lib/api/educator-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminMatchPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { updateMatchForEducator } from "@/lib/db/teams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const educator = await getEducatorContext(request);

  if (!educator.ok) {
    return educator.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminMatchPayload(body, { partial: true });

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Match invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const match = await updateMatchForEducator(id, educator.context.user.id, educator.context.canManageAllTeams, payload.data);

    if (!match) {
      return jsonError(404, "NOT_FOUND", "Match introuvable ou non autorise.");
    }

    await recordActivity({
      actorId: educator.context.user.id,
      action: "educator.match.updated",
      entityType: "matches",
      entityId: match.id,
      metadata: {
        teamId: match.team_id,
        opponentName: match.opponent_name,
        status: match.status
      }
    });

    return jsonOk({ match });
  } catch (error) {
    return handleDbError("educator/matches/[id]", error);
  }
}
