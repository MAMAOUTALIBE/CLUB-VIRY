import type { NextRequest } from "next/server";

import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { validateRefreshSessionPayload } from "@/lib/api/validation";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "auth:refresh", { max: 20, windowMs: 60_000 });

  if (!rateLimit.allowed) {
    return jsonError(429, "RATE_LIMITED", "Trop de tentatives. Reessayez dans quelques instants.");
  }

  if (!isSupabaseConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase Auth n'est pas encore configure.");
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateRefreshSessionPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Session invalide.", payload.issues);
  }

  const { data, error } = await getSupabaseClient().auth.refreshSession({
    refresh_token: payload.data.refreshToken
  });

  if (error) {
    // Détail Supabase journalisé côté serveur, message générique côté client
    // (ne pas exposer l'état interne du token / de la session).
    console.error("refresh error:", error.message);
    return jsonError(401, "AUTH_FAILED", "Session invalide ou expiree.");
  }

  return jsonOk({
    session: data.session
      ? {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at
        }
      : null
  });
}
