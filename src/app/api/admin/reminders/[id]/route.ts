import type { NextRequest } from "next/server";
import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminReminderPayload } from "@/lib/api/validation";
import { updateReminder } from "@/lib/db/messaging";
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
  const payload = validateAdminReminderPayload(body, { partial: true });
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Rappel invalide.", payload.issues);
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  try {
    const reminder = await updateReminder(id, payload.data);
    if (!reminder) return jsonError(404, "NOT_FOUND", "Rappel introuvable.");
    await recordActivity({ actorId: admin.context.user.id, action: "reminder.updated", entityType: "scheduled_reminders", entityId: reminder.id, metadata: { status: reminder.status } });
    return jsonOk({ reminder });
  } catch (error) {
    return handleDbError("admin/reminders/[id]", error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "communication:manage");
  if (!admin.ok) return admin.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  try {
    if (!(await softDeleteRow("reminders", id, admin.context.user.id))) return jsonError(404, "NOT_FOUND", "Rappel introuvable.");
    await recordActivity({ actorId: admin.context.user.id, action: "reminder.trashed", entityType: "scheduled_reminders", entityId: id });
    return jsonOk({ trashed: true });
  } catch (error) {
    return handleDbError("admin/reminders/[id] DELETE", error);
  }
}
