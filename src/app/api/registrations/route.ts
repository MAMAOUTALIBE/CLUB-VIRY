import type { NextRequest } from "next/server";

import { checkRateLimit } from "@/lib/api/rate-limit";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateRegistrationPayload } from "@/lib/api/validation";
import { getAuthContext } from "@/lib/auth/session";
import { createRegistration, listRegistrationsForProfile } from "@/lib/db/registrations";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);

  if (!auth.ok) {
    return jsonError(auth.status, auth.code, auth.message);
  }

  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  try {
    const registrations = await listRegistrationsForProfile(auth.context.user.id);
    return jsonOk({ registrations });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur inscriptions inconnue.");
  }
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "registrations:create", { max: 20, windowMs: 60_000 });

  if (!rateLimit.allowed) {
    return jsonError(429, "RATE_LIMITED", "Trop de tentatives. Reessayez dans quelques instants.");
  }

  const auth = await getAuthContext(request);

  if (!auth.ok) {
    return jsonError(auth.status, auth.code, auth.message);
  }

  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateRegistrationPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Inscription invalide.", payload.issues);
  }

  try {
    const registration = await createRegistration({
      profileId: auth.context.user.id,
      playerId: payload.data.playerId,
      seasonId: payload.data.seasonId,
      categoryId: payload.data.categoryId ?? null,
      notes: payload.data.notes ?? null
    });

    return jsonOk(registration, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur creation inscription inconnue.";
    const status = message.includes("Forbidden") ? 403 : 500;
    return jsonError(status, status === 403 ? "FORBIDDEN" : "SUPABASE_ERROR", message);
  }
}
