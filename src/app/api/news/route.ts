import type { NextRequest } from "next/server";

import { jsonError, jsonOk } from "@/lib/api/http";
import { listPublishedNews } from "@/lib/db/content";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 12) || 12, 50);

  try {
    const news = await listPublishedNews(limit);
    return jsonOk({ news });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur actualites inconnue.");
  }
}
