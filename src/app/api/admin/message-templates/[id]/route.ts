import type { NextRequest } from "next/server";
import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminMessageTemplatePayload } from "@/lib/api/validation";
import { updateMessageTemplate } from "@/lib/db/messaging";
import { recordActivity } from "@/lib/db/foundations";
import { softDeleteRow } from "@/lib/db/soft-delete";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "communication:manage");
  if (!admin.ok) return admin.response;
  const body = await readJsonBody(request);
  if (body === undefined) return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  const payload = validateAdminMessageTemplatePayload(body, { partial: true });
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Modèle invalide.", payload.issues);
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  try {
    const template = await updateMessageTemplate(id, payload.data);
    if (!template) return jsonError(404, "NOT_FOUND", "Modèle introuvable.");
    await recordActivity({ actorId: admin.context.user.id, action: "message_template.updated", entityType: "message_templates", entityId: template.id, metadata: { key: template.key, isActive: template.is_active } });
    return jsonOk({ messageTemplate: template });
  } catch (error) {
    return handleDbError("admin/message-templates/[id]", error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "communication:manage");
  if (!admin.ok) return admin.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  try {
    if (!(await softDeleteRow("message_templates", id, admin.context.user.id))) return jsonError(404, "NOT_FOUND", "Modèle introuvable.");
    await recordActivity({ actorId: admin.context.user.id, action: "message_template.trashed", entityType: "message_templates", entityId: id });
    return jsonOk({ trashed: true });
  } catch (error) {
    return handleDbError("admin/message-templates/[id] DELETE", error);
  }
}
