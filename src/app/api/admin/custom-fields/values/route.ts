import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { hasPermission } from "@/lib/auth/permissions";
import { isUuid, validateCustomFieldValuesPayload } from "@/lib/api/validation";
import { getCustomFieldValues, setCustomFieldValues } from "@/lib/db/custom-fields";
import { recordActivity } from "@/lib/db/foundations";
import { customFieldEntityPermission, isCustomFieldEntity } from "@/lib/custom-fields";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lire/écrire les valeurs exige la permission de gestion de l'ENTITÉ (ex : partner -> partners:manage),
// pas seulement l'accès config : c'est le contenu de la fiche métier qu'on touche.
export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:access");
  if (!admin.ok) return admin.response;

  const entity = request.nextUrl.searchParams.get("entity");
  const id = request.nextUrl.searchParams.get("id");
  if (!entity || !isCustomFieldEntity(entity)) return jsonError(400, "VALIDATION_ERROR", "Type de fiche invalide.");
  if (!id || !isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant de fiche invalide.");

  const role = admin.context.profile?.role;
  const permission = customFieldEntityPermission(entity);
  if (permission && (!role || !hasPermission(role, permission))) {
    return jsonError(403, "FORBIDDEN", "Vous n'avez pas les droits sur ce type de fiche.");
  }

  try {
    return jsonOk(await getCustomFieldValues(entity, id));
  } catch (error) {
    return handleDbError("admin/custom-fields/values", error);
  }
}

export async function PUT(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:access");
  if (!admin.ok) return admin.response;

  const body = await readJsonBody(request);
  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  }

  const payload = validateCustomFieldValuesPayload(body);
  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Valeurs invalides.", payload.issues);
  }

  const role = admin.context.profile?.role;
  const permission = customFieldEntityPermission(payload.data.entityType);
  if (permission && (!role || !hasPermission(role, permission))) {
    return jsonError(403, "FORBIDDEN", "Vous n'avez pas les droits sur ce type de fiche.");
  }

  try {
    await setCustomFieldValues(payload.data.entityType, payload.data.entityId, payload.data.values);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "custom_field.values_updated",
      entityType: payload.data.entityType,
      entityId: payload.data.entityId,
      metadata: { fields: Object.keys(payload.data.values).length }
    });
    return jsonOk({ saved: true });
  } catch (error) {
    return handleDbError("admin/custom-fields/values PUT", error);
  }
}
