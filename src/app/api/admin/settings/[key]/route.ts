import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { recordActivity } from "@/lib/db/foundations";
import { upsertSetting } from "@/lib/db/settings";
import { validateHomeHeroSetting } from "@/lib/home-hero";
import { isAllowedSettingKey } from "@/lib/settings-keys";
import { validateAnnouncementsSetting } from "@/lib/announcements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ key: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "content:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { key } = await context.params;

  if (!isAllowedSettingKey(key)) {
    return jsonError(400, "VALIDATION_ERROR", "Clé de paramètre inconnue.");
  }

  const body = await readJsonBody(request);

  if (body === undefined || typeof body !== "object" || body === null || Array.isArray(body)) {
    return jsonError(400, "INVALID_JSON", "Le corps doit être un objet JSON.");
  }

  let settingValue = body as Record<string, unknown>;
  if (key === "home_hero") {
    const validation = validateHomeHeroSetting(body);
    if (!validation.ok) {
      return jsonError(400, "VALIDATION_ERROR", "Le carrousel contient des données invalides.", validation.issues);
    }
    settingValue = { slides: validation.slides };
  } else if (key === "announcements") {
    const validation = validateAnnouncementsSetting(body);
    if (!validation.ok) return jsonError(400, "VALIDATION_ERROR", "Les annonces contiennent des données invalides.", validation.issues);
    settingValue = { items: validation.announcements };
  }

  try {
    await upsertSetting(key, settingValue);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "settings.updated",
      entityType: "site_settings",
      metadata: { key }
    });
    return jsonOk({ key });
  } catch (error) {
    return handleDbError("admin/settings/[key]", error);
  }
}
