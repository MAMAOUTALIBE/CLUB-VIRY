import type { NextRequest } from "next/server";
import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonOk } from "@/lib/api/http";
import { evaluateScheduledAutomations } from "@/lib/db/scheduled-automations";
import { processDueReminders } from "@/lib/db/messaging";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Déclenchement manuel (bouton) : traite les rappels dus ET évalue les règles conditionnelles. */
export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "automations:manage");
  if (!admin.ok) return admin.response;
  try {
    const nowIso = new Date().toISOString();
    const reminders = await processDueReminders(nowIso);
    const automations = await evaluateScheduledAutomations(nowIso);
    await recordActivity({ actorId: admin.context.user.id, action: "scheduled_automation.run", entityType: "scheduled_automations", metadata: { reminders, automations } });
    return jsonOk({ reminders, automations });
  } catch (error) {
    return handleDbError("admin/scheduled-automations/run", error);
  }
}
