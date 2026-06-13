import type { NextRequest } from "next/server";

import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { getAuthContext } from "@/lib/auth/session";
import { getFamilyDashboard } from "@/lib/db/family";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);

  if (!auth.ok) {
    return jsonError(auth.status, auth.code, auth.message);
  }

  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  try {
    const dashboard = await getFamilyDashboard(auth.context.user.id);
    return jsonOk(dashboard);
  } catch (error) {
    return handleDbError("family", error);
  }
}
