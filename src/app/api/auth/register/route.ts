import type { NextRequest } from "next/server";

import { checkRateLimit } from "@/lib/api/rate-limit";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateRegisterPayload } from "@/lib/api/validation";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "auth:register", { max: 6, windowMs: 60_000 });

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

  const payload = validateRegisterPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Inscription invalide.", payload.issues);
  }

  const displayName = [payload.data.firstName, payload.data.lastName].filter(Boolean).join(" ") || payload.data.email;
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: payload.data.email,
    password: payload.data.password,
    options: {
      data: {
        display_name: displayName,
        first_name: payload.data.firstName ?? null,
        last_name: payload.data.lastName ?? null,
        role: payload.data.role
      }
    }
  });

  if (error) {
    // Log serveur uniquement ; on renvoie un message générique pour ne pas révéler
    // si l'adresse existe déjà (anti-énumération de comptes — données de familles/mineurs).
    console.error("register error:", error.message);
    return jsonError(400, "AUTH_FAILED", "Inscription impossible. Verifiez vos informations puis reessayez.");
  }

  return jsonOk(
    {
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email,
            role: payload.data.role
          }
        : null,
      emailConfirmationRequired: !data.session
    },
    201
  );
}
