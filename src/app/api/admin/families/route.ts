import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { listFamiliesForAdmin } from "@/lib/db/family";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "players:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 100) || 100, 500);

  try {
    const payload = await listFamiliesForAdmin(limit);
    return jsonOk(payload);
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur familles admin inconnue.");
  }
}
