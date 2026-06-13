import type { NextRequest } from "next/server";

import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { getAuthContext } from "@/lib/auth/session";
import { countUnreadNotifications, listInAppNotifications, markNotificationsRead } from "@/lib/db/notification-center";
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
    const [notifications, unread] = await Promise.all([
      listInAppNotifications(auth.context.user.id),
      countUnreadNotifications(auth.context.user.id)
    ]);
    return jsonOk({ notifications, unread });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur notifications inconnue.");
  }
}

/** Marque comme lues : { ids: string[] } pour une sélection, ou corps vide = tout. */
export async function PATCH(request: NextRequest) {
  const auth = await getAuthContext(request);

  if (!auth.ok) {
    return jsonError(auth.status, auth.code, auth.message);
  }

  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  const body = await readJsonBody(request);
  const rawIds = body && typeof body === "object" ? (body as Record<string, unknown>).ids : undefined;
  const ids = Array.isArray(rawIds) ? rawIds.filter((value): value is string => typeof value === "string") : undefined;

  try {
    await markNotificationsRead(auth.context.user.id, ids);
    return jsonOk({ updated: true });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur notifications inconnue.");
  }
}
