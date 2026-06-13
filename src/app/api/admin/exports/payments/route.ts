import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { rowsToCsv } from "@/lib/api/csv";
import { handleDbError, jsonError } from "@/lib/api/http";
import { listPaymentsForAdmin } from "@/lib/db/recruitment-shop";
import type { Payment } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CSV_HEADERS: Array<keyof Payment> = [
  "id",
  "order_id",
  "registration_id",
  "provider",
  "provider_reference",
  "status",
  "amount_cents",
  "currency",
  "metadata",
  "created_at",
  "updated_at"
];

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "payments:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 1000) || 1000, 5000);

  try {
    const payments = await listPaymentsForAdmin(limit);
    const csv = rowsToCsv(CSV_HEADERS, payments);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=paiements-es-viry.csv"
      }
    });
  } catch (error) {
    return handleDbError("admin/exports/payments", error);
  }
}
