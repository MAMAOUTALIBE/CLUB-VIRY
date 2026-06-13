import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { listSubscriptionsForAdmin } from "@/lib/db/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:manage_users");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 200) || 200, 500);

  try {
    const subscriptions = await listSubscriptionsForAdmin(limit);
    return jsonOk({ subscriptions });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur abonnements inconnue.");
  }
}
