import type { NextRequest } from "next/server";

import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { getAuthContext } from "@/lib/auth/session";
import { getNotificationPreferences, isNotificationCategory, setNotificationPreference } from "@/lib/db/notification-center";
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
    const preferences = await getNotificationPreferences(auth.context.user.id);
    return jsonOk({ preferences });
  } catch (error) {
    return handleDbError("family/notifications/preferences", error);
  }
}

/** Met à jour un canal d'une catégorie : { category, email?, push? }. */
export async function PATCH(request: NextRequest) {
  const auth = await getAuthContext(request);

  if (!auth.ok) {
    return jsonError(auth.status, auth.code, auth.message);
  }

  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  const body = await readJsonBody(request);
  const rec = body && typeof body === "object" ? (body as Record<string, unknown>) : undefined;

  if (!isNotificationCategory(rec?.category)) {
    return jsonError(400, "VALIDATION_ERROR", "Categorie de notification invalide.");
  }

  const channels: { email?: boolean; push?: boolean } = {};
  if (typeof rec?.email === "boolean") channels.email = rec.email;
  if (typeof rec?.push === "boolean") channels.push = rec.push;

  if (channels.email === undefined && channels.push === undefined) {
    return jsonError(400, "VALIDATION_ERROR", "Aucun canal a modifier (email ou push).");
  }

  try {
    await setNotificationPreference(auth.context.user.id, rec.category, channels);
    const preferences = await getNotificationPreferences(auth.context.user.id);
    return jsonOk({ preferences });
  } catch (error) {
    return handleDbError("family/notifications/preferences", error);
  }
}
