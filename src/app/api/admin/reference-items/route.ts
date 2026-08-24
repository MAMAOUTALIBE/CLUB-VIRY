import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminReferenceItemPayload } from "@/lib/api/validation";
import { createReferenceItem, listReferenceItems } from "@/lib/db/reference-lists";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "automations:manage");
  if (!admin.ok) return admin.response;
  const listId = request.nextUrl.searchParams.get("list");
  if (!listId || !isUuid(listId)) return jsonError(400, "VALIDATION_ERROR", "Liste invalide.");
  try {
    return jsonOk({ referenceItems: await listReferenceItems(listId) });
  } catch (error) {
    return handleDbError("admin/reference-items", error);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "automations:manage");
  if (!admin.ok) return admin.response;
  const body = await readJsonBody(request);
  if (body === undefined) return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  const payload = validateAdminReferenceItemPayload(body);
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Valeur invalide.", payload.issues);
  try {
    const item = await createReferenceItem(payload.data);
    await recordActivity({ actorId: admin.context.user.id, action: "reference_item.created", entityType: "reference_items", entityId: item.id, metadata: { listId: item.list_id, value: item.value } });
    return jsonOk({ referenceItem: item }, 201);
  } catch (error) {
    return handleDbError("admin/reference-items", error);
  }
}
