import type { NextRequest } from "next/server";

import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { getAuthContext } from "@/lib/auth/session";
import { listAuthorizedLiveMatches } from "@/lib/db/family-media-access";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!auth.ok) return jsonError(auth.status, auth.code, auth.message);
  if (!isSupabaseAdminConfigured) return jsonError(503, "CONFIGURATION_ERROR", "Service non configuré.");

  try {
    const result = await listAuthorizedLiveMatches(auth.context.user.id);
    if (!result.authorized) {
      return jsonError(403, "FORBIDDEN", "Aucun Pass Famille Média actif ne permet l’accès aux matchs en direct.");
    }

    const response = jsonOk({ matches: result.matches });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return handleDbError("family/matches/live", error);
  }
}
