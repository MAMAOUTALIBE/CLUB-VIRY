import type { NextRequest } from "next/server";

import { handleDbError, jsonError, jsonOk, parseLimit } from "@/lib/api/http";
import { getAuthContext } from "@/lib/auth/session";
import { listAuthorizedFamilyMedia } from "@/lib/db/family-media-access";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!auth.ok) return jsonError(auth.status, auth.code, auth.message);
  if (!isSupabaseAdminConfigured) return jsonError(503, "CONFIGURATION_ERROR", "Stockage non configuré.");

  try {
    const result = await listAuthorizedFamilyMedia(auth.context.user.id, {
      limit: parseLimit(request.nextUrl.searchParams.get("limit"), 100, 200)
    });
    if (!result.authorized) {
      return jsonError(403, "FORBIDDEN", "Aucun Pass Famille Média actif ne permet cet accès.");
    }
    const response = jsonOk({ assets: result.assets });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return handleDbError("family/media", error);
  }
}
