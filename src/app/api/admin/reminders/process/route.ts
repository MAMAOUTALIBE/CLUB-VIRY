import type { NextRequest } from "next/server";
import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonOk } from "@/lib/api/http";
import { processDueReminders } from "@/lib/db/messaging";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Traite les rappels échus (déclenchable manuellement ; branchable sur un cron plus tard). */
export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "communication:manage");
  if (!admin.ok) return admin.response;
  try {
    const result = await processDueReminders(new Date().toISOString());
    if (result.processed > 0) {
      await recordActivity({ actorId: admin.context.user.id, action: "reminder.processed", entityType: "scheduled_reminders", metadata: { ...result } });
    }
    return jsonOk(result);
  } catch (error) {
    return handleDbError("admin/reminders/process", error);
  }
}
