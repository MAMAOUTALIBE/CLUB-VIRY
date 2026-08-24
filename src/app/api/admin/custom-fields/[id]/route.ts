import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminCustomFieldPayload } from "@/lib/api/validation";
import { updateCustomFieldDefinition } from "@/lib/db/custom-fields";
import { recordActivity } from "@/lib/db/foundations";
import { softDeleteRow } from "@/lib/db/soft-delete";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "automations:manage");
  if (!admin.ok) return admin.response;

  const body = await readJsonBody(request);
  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  }

  const payload = validateAdminCustomFieldPayload(body, { partial: true });
  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Champ personnalisé invalide.", payload.issues);
  }
  // L'entité et la clé sont structurantes : on ne les modifie pas après création.
  delete payload.data.entityType;
  delete payload.data.key;

  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");

  try {
    const field = await updateCustomFieldDefinition(id, payload.data);
    if (!field) return jsonError(404, "NOT_FOUND", "Champ personnalisé introuvable.");
    await recordActivity({
      actorId: admin.context.user.id,
      action: "custom_field.updated",
      entityType: "custom_field_definitions",
      entityId: field.id,
      metadata: { entity: field.entity_type, key: field.key, isActive: field.is_active }
    });
    return jsonOk({ customField: field });
  } catch (error) {
    return handleDbError("admin/custom-fields/[id]", error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "automations:manage");
  if (!admin.ok) return admin.response;

  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");

  try {
    if (!(await softDeleteRow("custom_fields", id, admin.context.user.id))) {
      return jsonError(404, "NOT_FOUND", "Champ personnalisé introuvable.");
    }
    await recordActivity({
      actorId: admin.context.user.id,
      action: "custom_field.trashed",
      entityType: "custom_field_definitions",
      entityId: id
    });
    return jsonOk({ trashed: true });
  } catch (error) {
    return handleDbError("admin/custom-fields/[id] DELETE", error);
  }
}
