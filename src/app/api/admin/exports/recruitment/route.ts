import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { rowsToCsv } from "@/lib/api/csv";
import { handleDbError, jsonError } from "@/lib/api/http";
import { listRecruitmentApplicationsForAdmin } from "@/lib/db/recruitment-shop";
import type { RecruitmentApplication } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CSV_HEADERS: Array<keyof RecruitmentApplication> = [
  "id",
  "first_name",
  "last_name",
  "birth_date",
  "email",
  "phone",
  "current_club",
  "position",
  "category_id",
  "message",
  "status",
  "created_at",
  "updated_at"
];

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "players:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 1000) || 1000, 5000);

  try {
    const applications = await listRecruitmentApplicationsForAdmin(limit);
    const csv = rowsToCsv(CSV_HEADERS, applications);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=detections-es-viry.csv"
      }
    });
  } catch (error) {
    return handleDbError("admin/exports/recruitment", error);
  }
}
