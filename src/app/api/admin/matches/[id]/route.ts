import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminMatchPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { softDeleteRow } from "@/lib/db/soft-delete";
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
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");

  try {
    const match = await updateMatch(id, payload.data);
    if (!match) return jsonError(404, "NOT_FOUND", "Match introuvable.");
    revalidatePath("/");
    revalidatePath("/calendrier");
    revalidatePath("/resultats");
    await recordActivity({
      actorId: admin.context.user.id,
      action: "match.updated",
      entityType: "matches",
      entityId: match.id,
      metadata: { opponentName: match.opponent_name, status: match.status }
    });

    return jsonOk({ match });
  } catch (error) {
    return handleDbError("admin/matches/[id]", error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "matches:manage");
  if (!admin.ok) return admin.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  try {
    const trashed = await softDeleteRow("matches", id, admin.context.user.id);
    if (!trashed) return jsonError(404, "NOT_FOUND", "Match introuvable.");
    await recordActivity({ actorId: admin.context.user.id, action: "match.trashed", entityType: "matches", entityId: id });
    revalidatePath("/calendrier");
    revalidatePath("/resultats");
    revalidatePath("/");
    return jsonOk({ trashed: true });
  } catch (error) {
    return handleDbError("admin/matches/[id]", error);
  }
}
