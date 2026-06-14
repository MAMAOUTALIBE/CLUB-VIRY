import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, parseLimit } from "@/lib/api/http";
import { listOrdersForAdmin } from "@/lib/db/recruitment-shop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "shop:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 100, 2000);

  try {
    const orders = await listOrdersForAdmin(limit);
    return jsonOk({ orders });
  } catch (error) {
    return handleDbError("admin/shop/orders", error);
  }
}
