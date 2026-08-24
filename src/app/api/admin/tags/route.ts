import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { hasPermission } from "@/lib/auth/permissions";
import { isUuid, validateEntityTagsPayload } from "@/lib/api/validation";
import { getEntityTagIds, listTagOptionsForEntity, setEntityTags } from "@/lib/db/reference-lists";
import { recordActivity } from "@/lib/db/foundations";
import { customFieldEntityPermission, isCustomFieldEntity } from "@/lib/custom-fields";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:access");
  if (!admin.ok) return admin.response;
  const entity = request.nextUrl.searchParams.get("entity");
  const id = request.nextUrl.searchParams.get("id");
  if (!entity || !isCustomFieldEntity(entity)) return jsonError(400, "VALIDATION_ERROR", "Type de fiche invalide.");
  if (!id || !isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant de fiche invalide.");
  const role = admin.context.profile?.role;
  const permission = customFieldEntityPermission(entity);
  if (permission && (!role || !hasPermission(role, permission))) return jsonError(403, "FORBIDDEN", "Droits insuffisants sur ce type de fiche.");
  try {
    const [options, selected] = await Promise.all([listTagOptionsForEntity(entity), getEntityTagIds(entity, id)]);
    return jsonOk({ options, selected });
  } catch (error) {
    return handleDbError("admin/tags", error);
  }
}

export async function PUT(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:access");
  if (!admin.ok) return admin.response;
  const body = await readJsonBody(request);
  if (body === undefined) return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  const payload = validateEntityTagsPayload(body);
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Tags invalides.", payload.issues);
  const role = admin.context.profile?.role;
  const permission = customFieldEntityPermission(payload.data.entityType);
  if (permission && (!role || !hasPermission(role, permission))) return jsonError(403, "FORBIDDEN", "Droits insuffisants sur ce type de fiche.");
  try {
    await setEntityTags(payload.data.entityType, payload.data.entityId, payload.data.itemIds);
    await recordActivity({ actorId: admin.context.user.id, action: "entity_tags.updated", entityType: payload.data.entityType, entityId: payload.data.entityId, metadata: { count: payload.data.itemIds.length } });
    return jsonOk({ saved: true });
  } catch (error) {
    return handleDbError("admin/tags PUT", error);
  }
}
