import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, parseLimit } from "@/lib/api/http";
import { listContactMessagesForAdmin } from "@/lib/db/contact-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:access");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 100, 2000);

  try {
    const messages = await listContactMessagesForAdmin(limit);
    return jsonOk({ messages });
  } catch (error) {
    return handleDbError("admin/contact-requests", error);
  }
}
