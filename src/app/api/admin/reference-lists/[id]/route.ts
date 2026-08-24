import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminReferenceListPayload } from "@/lib/api/validation";
import { isSystemReferenceList, updateReferenceList } from "@/lib/db/reference-lists";
import { recordActivity } from "@/lib/db/foundations";
import { softDeleteRow } from "@/lib/db/soft-delete";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "automations:manage");
  if (!admin.ok) return admin.response;
  const body = await readJsonBody(request);
  if (body === undefined) return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  const payload = validateAdminReferenceListPayload(body, { partial: true });
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Liste invalide.", payload.issues);
  delete payload.data.key; // la clé est structurante
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  try {
    const list = await updateReferenceList(id, payload.data);
    if (!list) return jsonError(404, "NOT_FOUND", "Liste introuvable.");
    await recordActivity({ actorId: admin.context.user.id, action: "reference_list.updated", entityType: "reference_lists", entityId: list.id, metadata: { key: list.key } });
    return jsonOk({ referenceList: list });
  } catch (error) {
    return handleDbError("admin/reference-lists/[id]", error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "automations:manage");
  if (!admin.ok) return admin.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  try {
    // Une liste « système » (amorcée) est protégée contre la suppression.
    if (await isSystemReferenceList(id)) {
      return jsonError(409, "CONFLICT", "Cette liste est protégée et ne peut pas être supprimée.");
    }
    if (!(await softDeleteRow("reference_lists", id, admin.context.user.id))) {
      return jsonError(404, "NOT_FOUND", "Liste introuvable.");
    }
    await recordActivity({ actorId: admin.context.user.id, action: "reference_list.trashed", entityType: "reference_lists", entityId: id });
    return jsonOk({ trashed: true });
  } catch (error) {
    return handleDbError("admin/reference-lists/[id] DELETE", error);
  }
}
