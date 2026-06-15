import type { NextRequest } from "next/server";

import { jsonError, jsonOk } from "@/lib/api/http";
import { checkRateLimit } from "@/lib/api/rate-limit";
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

  const refreshToken = request.cookies.get("admin_refresh")?.value;

  if (!refreshToken) {
    return jsonError(401, "AUTH_REQUIRED", "Session de renouvellement manquante.");
  }

  const { data, error } = await getSupabaseClient().auth.refreshSession({
    refresh_token: refreshToken
  });

  if (error || !data.session) {
    // Détail Supabase journalisé côté serveur, message générique côté client
    // (ne pas exposer l'état interne du token / de la session).
    if (error) {
      console.error("refresh error:", error.message);
    }
    return jsonError(401, "AUTH_FAILED", "Session invalide ou expiree.");
  }

  const response = jsonOk({
    session: {
      expiresAt: data.session.expires_at
    }
  });

  const secure = process.env.NODE_ENV === "production";
  response.cookies.set("admin_session", data.session.access_token, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: data.session.expires_in ?? 3600
  });
  response.cookies.set("admin_refresh", data.session.refresh_token, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return response;
}
