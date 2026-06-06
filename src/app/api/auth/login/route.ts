import type { NextRequest } from "next/server";

import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { validateLoginPayload } from "@/lib/api/validation";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "auth:login", { max: 10, windowMs: 60_000 });

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

  const payload = validateLoginPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Connexion invalide.", payload.issues);
  }

  const { data, error } = await getSupabaseClient().auth.signInWithPassword(payload.data);

  if (error) {
    return jsonError(401, "AUTH_FAILED", error.message);
  }

  return jsonOk({
    user: data.user
      ? {
          id: data.user.id,
          email: data.user.email
        }
      : null,
    session: data.session
      ? {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at
        }
      : null
  });
}
