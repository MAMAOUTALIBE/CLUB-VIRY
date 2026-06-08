import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { jsonError, readJsonBody } from "@/lib/api/http";
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

  if (error || !data.session) {
    // Message générique : ne révèle pas si le compte existe (anti-énumération)
    // et ne propage pas l'erreur interne Supabase.
    return jsonError(401, "AUTH_FAILED", "Identifiants invalides.");
  }

  const response = NextResponse.json(
    {
      ok: true,
      data: {
        user: data.user ? { id: data.user.id, email: data.user.email } : null,
        session: {
          expiresAt: data.session.expires_at
        }
      }
    },
    { status: 200 }
  );

  const secure = process.env.NODE_ENV === "production";
  // Jetons en cookies HttpOnly (non lisibles par JS) au lieu du sessionStorage côté client.
  // Le cookie `admin_session` autorise aussi l'accès à /admin via le proxy.
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
