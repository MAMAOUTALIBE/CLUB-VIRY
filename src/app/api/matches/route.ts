import type { NextRequest } from "next/server";

import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { listMatches } from "@/lib/db/teams";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 20) || 20, 50);

  try {
    const matches = await listMatches(limit);
    return jsonOk({ matches });
  } catch (error) {
    return handleDbError("matches", error);
  }
}
