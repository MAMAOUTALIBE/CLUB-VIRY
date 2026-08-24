import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminCustomFieldPayload } from "@/lib/api/validation";
import { createCustomFieldDefinition, listCustomFieldDefinitions } from "@/lib/db/custom-fields";
import { recordActivity } from "@/lib/db/foundations";
import { isCustomFieldEntity } from "@/lib/custom-fields";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "automations:manage");
  if (!admin.ok) return admin.response;

  const entityParam = request.nextUrl.searchParams.get("entity");
  const entityType = entityParam && isCustomFieldEntity(entityParam) ? entityParam : undefined;
  const activeOnly = request.nextUrl.searchParams.get("active") === "1";

  try {
    return jsonOk({ customFields: await listCustomFieldDefinitions({ entityType, activeOnly }) });
  } catch (error) {
    return handleDbError("admin/custom-fields", error);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "automations:manage");
  if (!admin.ok) return admin.response;

  const body = await readJsonBody(request);
  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  }

  const payload = validateAdminCustomFieldPayload(body);
  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Champ personnalisé invalide.", payload.issues);
  }

  try {
    const field = await createCustomFieldDefinition(payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "custom_field.created",
      entityType: "custom_field_definitions",
      entityId: field.id,
      metadata: { entity: field.entity_type, key: field.key, type: field.type }
    });
    return jsonOk({ customField: field }, 201);
  } catch (error) {
    return handleDbError("admin/custom-fields", error);
  }
}
