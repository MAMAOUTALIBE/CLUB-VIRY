import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isSameOriginRequest } from "@/lib/api/origin";
import { validateAdminFamilyMediaPassBulkPayload } from "@/lib/api/validation";
import { bulkUpdateFamilyMediaPassStatus } from "@/lib/db/family-media-passes";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  if (!isSameOriginRequest(request)) return jsonError(403, "FORBIDDEN", "Origine de requête refusée.");

  const admin = await getAdminContext(request, "admin:manage_users");
  if (!admin.ok) return admin.response;

  const body = await readJsonBody(request);
  if (body === undefined) return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");

  const payload = validateAdminFamilyMediaPassBulkPayload(body);
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Action groupée invalide.", payload.issues);

  try {
    const result = await bulkUpdateFamilyMediaPassStatus(
      payload.data.ids,
      payload.data.status,
      admin.context.user.id
    );
    await recordActivity({
      actorId: admin.context.user.id,
      action: "family_media_pass.bulk_status_updated",
      entityType: "family_media_passes",
      metadata: {
        status: payload.data.status,
        requestedIds: payload.data.ids,
        succeeded: result.succeeded,
        failed: result.failed
      },
      userAgent: request.headers.get("user-agent")
    });
    return jsonOk({ result });
  } catch (error) {
    return handleDbError("admin/family-media-passes/bulk", error);
  }
}
