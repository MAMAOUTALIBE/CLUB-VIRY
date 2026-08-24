import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminReferenceListPayload } from "@/lib/api/validation";
import { createReferenceList, listReferenceLists } from "@/lib/db/reference-lists";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "automations:manage");
  if (!admin.ok) return admin.response;
  try {
    return jsonOk({ referenceLists: await listReferenceLists() });
  } catch (error) {
    return handleDbError("admin/reference-lists", error);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "automations:manage");
  if (!admin.ok) return admin.response;
  const body = await readJsonBody(request);
  if (body === undefined) return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  const payload = validateAdminReferenceListPayload(body);
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Liste invalide.", payload.issues);
  try {
    const list = await createReferenceList(payload.data);
    await recordActivity({ actorId: admin.context.user.id, action: "reference_list.created", entityType: "reference_lists", entityId: list.id, metadata: { key: list.key, kind: list.kind } });
    return jsonOk({ referenceList: list }, 201);
  } catch (error) {
    return handleDbError("admin/reference-lists", error);
  }
}
