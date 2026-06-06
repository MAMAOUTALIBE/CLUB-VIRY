import type { NextRequest } from "next/server";

import { getAuthContext } from "@/lib/auth/session";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateProfileUpdatePayload } from "@/lib/api/validation";
import { updateOwnProfile } from "@/lib/db/profiles";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);

  if (!auth.ok) {
    return jsonError(auth.status, auth.code, auth.message);
  }

  return jsonOk({
    user: {
      id: auth.context.user.id,
      email: auth.context.user.email
    },
    profile: auth.context.profile
  });
}

export async function PATCH(request: NextRequest) {
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

  const payload = validateProfileUpdatePayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Profil invalide.", payload.issues);
  }

  try {
    const profile = await updateOwnProfile(auth.context.user.id, payload.data);
    return jsonOk({ profile });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur mise a jour profil inconnue.");
  }
}
