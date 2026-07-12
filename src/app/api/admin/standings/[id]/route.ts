import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminStandingPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { deleteStanding, updateStanding } from "@/lib/db/standings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "teams:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  }

  const payload = validateAdminStandingPayload(body, { partial: true });

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Ligne de classement invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const standing = await updateStanding(id, payload.data);

    if (!standing) {
      return jsonError(404, "NOT_FOUND", "Ligne de classement introuvable.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "standing.updated",
      entityType: "standings",
      entityId: standing.id,
      metadata: { competition: standing.competition, teamName: standing.team_name }
    });
    revalidatePath("/resultats");

    return jsonOk({ standing });
  } catch (error) {
    return handleDbError("admin/standings/[id]", error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "teams:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  if (!isUuid(id)) {
    return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  }

  try {
    const deleted = await deleteStanding(id);

    if (!deleted) {
      return jsonError(404, "NOT_FOUND", "Ligne de classement introuvable.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "standing.deleted",
      entityType: "standings",
      entityId: id
    });
    revalidatePath("/resultats");

    return jsonOk({ deleted: true });
  } catch (error) {
    return handleDbError("admin/standings/[id]", error);
  }
}
