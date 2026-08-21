import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAutomationRuleTogglePayload } from "@/lib/api/validation";
import { getAutomationDefinition, isAutomationKey } from "@/lib/automations";
import { setAutomationRuleEnabled } from "@/lib/db/automations";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ key: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "automations:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { key } = await context.params;

  // Seules les règles réellement câblées existent : une clé libre créerait une
  // automatisation fantôme qui ne déclencherait jamais rien.
  if (!isAutomationKey(key)) {
    return jsonError(404, "NOT_FOUND", "Automatisation inconnue.");
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  }

  const payload = validateAutomationRuleTogglePayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Automatisation invalide.", payload.issues);
  }

  try {
    await setAutomationRuleEnabled(key, payload.data.isEnabled, admin.context.user.id);

    await recordActivity({
      actorId: admin.context.user.id,
      action: payload.data.isEnabled ? "automation.enabled" : "automation.disabled",
      entityType: "automation_rules",
      entityId: key,
      metadata: { event: getAutomationDefinition(key).event }
    });

    return jsonOk({ key, isEnabled: payload.data.isEnabled });
  } catch (error) {
    return handleDbError("admin/automations/[key]", error);
  }
}
