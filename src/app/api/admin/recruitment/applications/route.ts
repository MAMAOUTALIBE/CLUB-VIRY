import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, parseLimit } from "@/lib/api/http";
import { listRecruitmentApplicationsForAdmin } from "@/lib/db/recruitment-shop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "players:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 100, 2000);

  try {
    const applications = await listRecruitmentApplicationsForAdmin(limit);
    return jsonOk({ applications });
  } catch (error) {
    return handleDbError("admin/recruitment/applications", error);
  }
}
