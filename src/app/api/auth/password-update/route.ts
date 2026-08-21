import type { NextRequest } from "next/server";

import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { validatePasswordUpdatePayload } from "@/lib/api/validation";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Définit le mot de passe à partir du jeton d'un lien d'invitation ou de
 * réinitialisation. Le jeton n'est jamais stocké : il arrive dans le corps de la
 * requête, sert à une seule mise à jour, et le compte se connecte ensuite
 * normalement via /api/auth/login (cookies HttpOnly).
 */
export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "auth:password-update", { max: 10, windowMs: 60_000 });

  if (!rateLimit.allowed) {
    return jsonError(429, "RATE_LIMITED", "Trop de tentatives. Reessayez dans quelques instants.");
  }

  if (!isSupabaseConfigured || !isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase Auth n'est pas encore configure.");
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validatePasswordUpdatePayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Mot de passe invalide.", payload.issues);
  }

  // Le jeton du lien est vérifié par Supabase (signature + expiration) : le porter
  // prouve l'accès à la boîte mail du compte, ce qui autorise la nouvelle valeur.
  const { data, error } = await getSupabaseClient().auth.getUser(payload.data.accessToken);

  if (error || !data.user) {
    return jsonError(401, "AUTH_FAILED", "Lien expire ou deja utilise. Demandez-en un nouveau.");
  }

  const { error: updateError } = await getSupabaseAdminClient().auth.admin.updateUserById(data.user.id, {
    password: payload.data.password
  });

  if (updateError) {
    console.error("password-update error:", updateError.message);
    return jsonError(400, "AUTH_FAILED", "Mot de passe refuse. Choisissez-en un autre.");
  }

  return jsonOk({ email: data.user.email ?? null });
}
