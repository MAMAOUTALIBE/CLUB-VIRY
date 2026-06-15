import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, parseLimit } from "@/lib/api/http";
import { listPartnershipRequestsForAdmin } from "@/lib/db/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "partners:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 100, 500);

  try {
    const requests = await listPartnershipRequestsForAdmin(limit);
    return jsonOk({ requests });
  } catch (error) {
    return handleDbError("admin/partners/requests", error);
  }
}
