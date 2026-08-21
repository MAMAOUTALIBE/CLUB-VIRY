import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminFamilyPayload } from "@/lib/api/validation";
import { getFamilyDetailForAdmin, updateFamilyForAdmin } from "@/lib/db/family";
import { recordActivity } from "@/lib/db/foundations";
import { softDeleteRow } from "@/lib/db/soft-delete";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "players:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  try {
    const family = await getFamilyDetailForAdmin(id);

    if (!family) {
      return jsonError(404, "NOT_FOUND", "Famille introuvable.");
    }

    return jsonOk(family);
  } catch (error) {
    return handleDbError("admin/families/[id]", error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "players:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  if (!isUuid(id)) {
    return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  }

  const payload = validateAdminFamilyPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Famille invalide.", payload.issues);
  }

  try {
    const family = await updateFamilyForAdmin(id, payload.data.name);

    if (!family) {
      return jsonError(404, "NOT_FOUND", "Famille introuvable.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "family.updated",
      entityType: "families",
      entityId: family.id,
      metadata: { name: family.name }
    });

    return jsonOk({ family });
  } catch (error) {
    return handleDbError("admin/families/[id]", error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "players:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  if (!isUuid(id)) {
    return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  }

  try {
    // Archivage : les joueurs et dossiers rattachés restent intacts. La purge
    // définitive est refusée par la corbeille tant qu'ils existent.
    const trashed = await softDeleteRow("families", id, admin.context.user.id);

    if (!trashed) {
      return jsonError(404, "NOT_FOUND", "Famille introuvable.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "family.trashed",
      entityType: "families",
      entityId: id
    });

    return jsonOk({ trashed: true });
  } catch (error) {
    return handleDbError("admin/families/[id]", error);
  }
}
