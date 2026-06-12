import type { NextRequest } from "next/server";

import { getEducatorContext } from "@/lib/api/educator-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { recordActivity } from "@/lib/db/foundations";
import { deleteTrainingSessionForEducator } from "@/lib/db/sessions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
  const educator = await getEducatorContext(request);

  if (!educator.ok) {
    return educator.response;
  }

  const { sessionId } = await context.params;

  try {
    const removed = await deleteTrainingSessionForEducator(sessionId, educator.context.user.id, educator.context.canManageAllTeams);

    if (!removed) {
      return jsonError(404, "NOT_FOUND", "Seance introuvable ou non autorisee.");
    }

    await recordActivity({
      actorId: educator.context.user.id,
      action: "educator.session.deleted",
      entityType: "training_sessions",
      entityId: sessionId,
      metadata: { sessionId }
    });

    return jsonOk({ removed: true });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur suppression seance inconnue.");
  }
}
