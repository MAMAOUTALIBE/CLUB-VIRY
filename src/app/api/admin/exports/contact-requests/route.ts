import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { rowsToCsv } from "@/lib/api/csv";
import { handleDbError, jsonError } from "@/lib/api/http";
import { listContactMessagesForAdmin } from "@/lib/db/contact-admin";
import type { ContactMessage } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CSV_HEADERS: Array<keyof ContactMessage> = [
  "id",
  "full_name",
  "email",
  "phone",
  "subject",
  "message",
  "status",
  "source",
  "assigned_to",
  "responded_at",
  "created_at",
  "updated_at"
];

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:access");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 1000) || 1000, 5000);

  try {
    const messages = await listContactMessagesForAdmin(limit);
    const csv = rowsToCsv(CSV_HEADERS, messages);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=contacts-es-viry.csv"
      }
    });
  } catch (error) {
    return handleDbError("admin/exports/contact-requests", error);
  }
}
