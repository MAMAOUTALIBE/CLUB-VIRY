import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { listActivityLogs, listNotificationLogs } from "@/lib/db/contact-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:view_logs");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 30) || 30, 100);

  try {
    const [activityLogs, notificationLogs] = await Promise.all([listActivityLogs(limit), listNotificationLogs(limit)]);
    return jsonOk({ activityLogs, notificationLogs });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur logs inconnue.");
  }
}
