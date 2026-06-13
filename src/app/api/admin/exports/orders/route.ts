import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { rowsToCsv } from "@/lib/api/csv";
import { handleDbError, jsonError } from "@/lib/api/http";
import { listOrdersForAdmin } from "@/lib/db/recruitment-shop";
import type { Order } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CSV_HEADERS: Array<keyof Order> = [
  "id",
  "profile_id",
  "email",
  "customer_name",
  "phone",
  "status",
  "total_cents",
  "currency",
  "notes",
  "created_at",
  "updated_at"
];

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "shop:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 1000) || 1000, 5000);

  try {
    const orders = await listOrdersForAdmin(limit);
    const csv = rowsToCsv(CSV_HEADERS, orders);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=commandes-es-viry.csv"
      }
    });
  } catch (error) {
    return handleDbError("admin/exports/orders", error);
  }
}
