import type { NextRequest } from "next/server";
import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminReminderPayload } from "@/lib/api/validation";
import { createReminder, listReminders } from "@/lib/db/messaging";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "communication:manage");
  if (!admin.ok) return admin.response;
  try {
    return jsonOk({ reminders: await listReminders() });
  } catch (error) {
    return handleDbError("admin/reminders", error);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "communication:manage");
  if (!admin.ok) return admin.response;
  const body = await readJsonBody(request);
  if (body === undefined) return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  const payload = validateAdminReminderPayload(body);
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Rappel invalide.", payload.issues);
  try {
    const reminder = await createReminder(payload.data, admin.context.user.id);
    await recordActivity({ actorId: admin.context.user.id, action: "reminder.created", entityType: "scheduled_reminders", entityId: reminder.id, metadata: { channel: reminder.channel, runAt: reminder.run_at } });
    return jsonOk({ reminder }, 201);
  } catch (error) {
    return handleDbError("admin/reminders", error);
  }
}
