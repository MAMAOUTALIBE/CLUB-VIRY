import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { recordActivity } from "@/lib/db/foundations";
import { upsertSetting } from "@/lib/db/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_KEYS = new Set(["socials", "contact", "president", "inscriptions_banner", "club_stats", "values", "histoire", "organigramme", "stade"]);

type RouteContext = { params: Promise<{ key: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "content:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { key } = await context.params;

  if (!ALLOWED_KEYS.has(key)) {
    return jsonError(400, "VALIDATION_ERROR", "Clé de paramètre inconnue.");
  }

  const body = await readJsonBody(request);

  if (body === undefined || typeof body !== "object" || body === null || Array.isArray(body)) {
    return jsonError(400, "INVALID_JSON", "Le corps doit être un objet JSON.");
  }

  try {
    await upsertSetting(key, body as Record<string, unknown>);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "settings.updated",
      entityType: "site_settings",
      metadata: { key }
    });
    return jsonOk({ key });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur enregistrement parametre.");
  }
}
