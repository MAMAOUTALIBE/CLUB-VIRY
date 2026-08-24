import type { NextRequest } from "next/server";
import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminScheduledAutomationPayload } from "@/lib/api/validation";
import { updateScheduledAutomation } from "@/lib/db/scheduled-automations";
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
  const payload = validateAdminScheduledAutomationPayload(body, { partial: true });
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Règle invalide.", payload.issues);
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  try {
    const rule = await updateScheduledAutomation(id, payload.data);
    if (!rule) return jsonError(404, "NOT_FOUND", "Règle introuvable.");
    await recordActivity({ actorId: admin.context.user.id, action: "scheduled_automation.updated", entityType: "scheduled_automations", entityId: rule.id, metadata: { isActive: rule.is_active } });
    return jsonOk({ scheduledAutomation: rule });
  } catch (error) {
    return handleDbError("admin/scheduled-automations/[id]", error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "automations:manage");
  if (!admin.ok) return admin.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  try {
    if (!(await softDeleteRow("scheduled_automations", id, admin.context.user.id))) return jsonError(404, "NOT_FOUND", "Règle introuvable.");
    await recordActivity({ actorId: admin.context.user.id, action: "scheduled_automation.trashed", entityType: "scheduled_automations", entityId: id });
    return jsonOk({ trashed: true });
  } catch (error) {
    return handleDbError("admin/scheduled-automations/[id] DELETE", error);
  }
}
