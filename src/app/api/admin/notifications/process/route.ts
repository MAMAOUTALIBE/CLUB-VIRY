import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { recordActivity } from "@/lib/db/foundations";
import { dispatchQueuedNotifications } from "@/lib/db/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:view_logs");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit") ?? 20) || 20, 1), 50);

  try {
    const dispatch = await dispatchQueuedNotifications(limit);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "notifications.dispatch_processed",
      entityType: "notification_log",
      metadata: {
        limit,
        providerConfigured: dispatch.providerConfigured,
        processed: dispatch.processed,
        sent: dispatch.sent,
        failed: dispatch.failed,
        skipped: dispatch.skipped
      },
      userAgent: request.headers.get("user-agent")
    });

    return jsonOk(dispatch);
  } catch (error) {
    return handleDbError("admin/notifications/process", error);
  }
}
