import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminReferenceItemPayload } from "@/lib/api/validation";
import { updateReferenceItem } from "@/lib/db/reference-lists";
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
  const payload = validateAdminReferenceItemPayload(body, { partial: true });
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Valeur invalide.", payload.issues);
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  try {
    const item = await updateReferenceItem(id, payload.data);
    if (!item) return jsonError(404, "NOT_FOUND", "Valeur introuvable.");
    await recordActivity({ actorId: admin.context.user.id, action: "reference_item.updated", entityType: "reference_items", entityId: item.id, metadata: { value: item.value, isActive: item.is_active } });
    return jsonOk({ referenceItem: item });
  } catch (error) {
    return handleDbError("admin/reference-items/[id]", error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "automations:manage");
  if (!admin.ok) return admin.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  try {
    if (!(await softDeleteRow("reference_items", id, admin.context.user.id))) return jsonError(404, "NOT_FOUND", "Valeur introuvable.");
    await recordActivity({ actorId: admin.context.user.id, action: "reference_item.trashed", entityType: "reference_items", entityId: id });
    return jsonOk({ trashed: true });
  } catch (error) {
    return handleDbError("admin/reference-items/[id] DELETE", error);
  }
}
