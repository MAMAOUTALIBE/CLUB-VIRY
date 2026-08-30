import type { NextRequest } from "next/server";

import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { getAuthContext } from "@/lib/auth/session";
import { getFamilyMediaPassOverview } from "@/lib/db/family-media-access";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!auth.ok) return jsonError(auth.status, auth.code, auth.message);
  if (!isSupabaseAdminConfigured) return jsonError(503, "CONFIGURATION_ERROR", "Service non configuré.");

  try {
    const response = jsonOk({ passes: await getFamilyMediaPassOverview(auth.context.user.id) });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return handleDbError("family/media-pass", error);
  }
}
