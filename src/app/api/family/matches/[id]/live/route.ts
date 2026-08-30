import type { NextRequest } from "next/server";

import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { isUuid } from "@/lib/api/validation";
import { getAuthContext } from "@/lib/auth/session";
import { getAuthorizedLiveMatch } from "@/lib/db/family-media-access";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await getAuthContext(request);
  if (!auth.ok) return jsonError(auth.status, auth.code, auth.message);
  if (!isSupabaseAdminConfigured) return jsonError(503, "CONFIGURATION_ERROR", "Service non configuré.");

  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant de match invalide.");

  try {
    const { decision, followUrl } = await getAuthorizedLiveMatch(auth.context.user.id, id);
    if (!decision.ok || !followUrl) {
      return jsonError(403, "FORBIDDEN", "Ce direct n'est pas autorisé pour votre famille.");
    }
    const response = jsonOk({ url: followUrl });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return handleDbError("family/matches/[id]/live", error);
  }
}
