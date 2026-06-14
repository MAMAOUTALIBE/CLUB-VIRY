import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, parseLimit } from "@/lib/api/http";
import { listFamiliesForAdmin } from "@/lib/db/family";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "players:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 100, 2000);

  try {
    const payload = await listFamiliesForAdmin(limit);
    return jsonOk(payload);
  } catch (error) {
    return handleDbError("admin/families", error);
  }
}
