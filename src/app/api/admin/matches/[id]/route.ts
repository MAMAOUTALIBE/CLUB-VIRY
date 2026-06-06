import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminMatchPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { updateMatch } from "@/lib/db/teams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "matches:manage");

  if (!admin.ok) {
    return admin.response;
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
    const match = await updateMatch(id, payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "match.updated",
      entityType: "matches",
      entityId: match.id,
      metadata: { opponentName: match.opponent_name, status: match.status }
    });

    return jsonOk({ match });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur mise a jour match inconnue.");
  }
}
