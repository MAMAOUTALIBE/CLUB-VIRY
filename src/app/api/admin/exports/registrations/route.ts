import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { rowsToCsv } from "@/lib/api/csv";
import { jsonError } from "@/lib/api/http";
import { listRegistrationsForExport } from "@/lib/db/contact-admin";
import type { Registration } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CSV_HEADERS: Array<keyof Registration> = [
  "id",
  "season_id",
  "family_id",
  "player_id",
  "category_id",
  "submitted_by",
  "status",
  "notes",
  "submitted_at",
  "reviewed_at",
  "reviewed_by",
  "created_at",
  "updated_at"
];

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "registrations:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 1000) || 1000, 5000);

  try {
    const registrations = await listRegistrationsForExport(limit);
    const csv = rowsToCsv(CSV_HEADERS, registrations);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=inscriptions-es-viry.csv"
      }
    });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur export inscriptions inconnue.");
  }
}
