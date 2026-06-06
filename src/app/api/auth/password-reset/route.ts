import type { NextRequest } from "next/server";

import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { validatePasswordResetPayload } from "@/lib/api/validation";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "auth:password-reset", { max: 5, windowMs: 60_000 });

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

  const payload = validatePasswordResetPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Demande invalide.", payload.issues);
  }

  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin}/espace-membre`;
  const { error } = await getSupabaseClient().auth.resetPasswordForEmail(payload.data.email, {
    redirectTo
  });

  if (error) {
    return jsonError(400, "SUPABASE_ERROR", error.message);
  }

  return jsonOk({ sent: true });
}
