import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { getAdminDashboard } from "@/lib/db/contact-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:access");

  if (!admin.ok) {
    return admin.response;
  }

  try {
    const dashboard = await getAdminDashboard();
    return jsonOk(dashboard);
  } catch (error) {
    return handleDbError("admin/dashboard", error);
  }
}
