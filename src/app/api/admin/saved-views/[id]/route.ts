import type { NextRequest } from "next/server";
import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminSavedViewPayload } from "@/lib/api/validation";
import { deleteSavedView, updateSavedView } from "@/lib/db/saved-views";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "admin:access");
  if (!admin.ok) return admin.response;
  const body = await readJsonBody(request);
  if (body === undefined) return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  const payload = validateAdminSavedViewPayload(body, { partial: true });
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Vue invalide.", payload.issues);
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  try {
    const view = await updateSavedView(id, payload.data, admin.context.user.id);
    if (!view) return jsonError(404, "NOT_FOUND", "Vue introuvable.");
    await recordActivity({ actorId: admin.context.user.id, action: "saved_view.updated", entityType: "saved_views", entityId: view.id });
    return jsonOk({ savedView: view });
  } catch (error) {
    return handleDbError("admin/saved-views/[id]", error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "admin:access");
  if (!admin.ok) return admin.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  try {
    if (!(await deleteSavedView(id, admin.context.user.id))) return jsonError(404, "NOT_FOUND", "Vue introuvable.");
    await recordActivity({ actorId: admin.context.user.id, action: "saved_view.deleted", entityType: "saved_views", entityId: id });
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleDbError("admin/saved-views/[id] DELETE", error);
  }
}
