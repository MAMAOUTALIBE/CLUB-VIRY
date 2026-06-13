import type { NextRequest } from "next/server";

import { getEducatorContext } from "@/lib/api/educator-auth";
import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { recordActivity } from "@/lib/db/foundations";
import { removeTeamPlayerForEducator } from "@/lib/db/teams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
    playerId: string;
  }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  const educator = await getEducatorContext(request);

  if (!educator.ok) {
    return educator.response;
  }

  const { id, playerId } = await context.params;

  try {
    const removed = await removeTeamPlayerForEducator(id, educator.context.user.id, educator.context.canManageAllTeams, playerId);

    if (!removed) {
      return jsonError(404, "NOT_FOUND", "Equipe introuvable ou non autorisee.");
    }

    await recordActivity({
      actorId: educator.context.user.id,
      action: "educator.player.removed",
      entityType: "team_players",
      entityId: playerId,
      metadata: { teamId: id, playerId }
    });

    return jsonOk({ removed: true });
  } catch (error) {
    return handleDbError("educator/teams/[id]/players/[playerId]", error);
  }
}
