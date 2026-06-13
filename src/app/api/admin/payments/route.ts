import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { listPaymentsForAdmin } from "@/lib/db/recruitment-shop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "payments:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 100) || 100, 500);

  try {
    const payments = await listPaymentsForAdmin(limit);
    return jsonOk({ payments });
  } catch (error) {
    return handleDbError("admin/payments", error);
  }
}
