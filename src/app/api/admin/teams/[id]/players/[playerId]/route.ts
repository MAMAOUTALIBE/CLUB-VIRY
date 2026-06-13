import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { recordActivity } from "@/lib/db/foundations";
import { removeTeamPlayer } from "@/lib/db/teams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
    playerId: string;
  }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "teams:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id, playerId } = await context.params;

  try {
    await removeTeamPlayer(id, playerId);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "team.player.removed",
      entityType: "team_players",
      entityId: playerId,
      metadata: { teamId: id, playerId }
    });

    return jsonOk({ removed: true });
  } catch (error) {
    return handleDbError("admin/teams/[id]/players/[playerId]", error);
  }
}
