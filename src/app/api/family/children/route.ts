import type { NextRequest } from "next/server";

import { checkRateLimit } from "@/lib/api/rate-limit";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateChildPayload } from "@/lib/api/validation";
import { getAuthContext } from "@/lib/auth/session";
import { createFamilyForProfile, createPlayer, isProfileFamilyMember } from "@/lib/db/family";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "family:children:create", { max: 20, windowMs: 60_000 });

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

  const payload = validateChildPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Enfant invalide.", payload.issues);
  }

  try {
    let familyId = payload.data.familyId;

    if (familyId) {
      const isMember = await isProfileFamilyMember(auth.context.user.id, familyId);

      if (!isMember) {
        return jsonError(403, "FORBIDDEN", "Vous ne pouvez pas modifier cette famille.");
      }
    } else {
      const family = await createFamilyForProfile(auth.context.profile, auth.context.user.id, auth.context.user.email);
      familyId = family.id;
    }

    const player = await createPlayer({
      familyId,
      createdBy: auth.context.user.id,
      firstName: payload.data.firstName,
      lastName: payload.data.lastName,
      birthDate: payload.data.birthDate,
      gender: payload.data.gender,
      categoryId: payload.data.categoryId ?? null
    });

    return jsonOk({ player }, 201);
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur enfant inconnue.");
  }
}
