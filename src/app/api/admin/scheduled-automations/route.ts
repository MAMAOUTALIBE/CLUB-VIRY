import type { NextRequest } from "next/server";
import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminScheduledAutomationPayload } from "@/lib/api/validation";
import { createScheduledAutomation, listScheduledAutomations } from "@/lib/db/scheduled-automations";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "automations:manage");
  if (!admin.ok) return admin.response;
  try {
    return jsonOk({ scheduledAutomations: await listScheduledAutomations() });
  } catch (error) {
    return handleDbError("admin/scheduled-automations", error);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "automations:manage");
  if (!admin.ok) return admin.response;
  const body = await readJsonBody(request);
  if (body === undefined) return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  const payload = validateAdminScheduledAutomationPayload(body);
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Règle invalide.", payload.issues);
  try {
    const rule = await createScheduledAutomation(payload.data, admin.context.user.id);
    await recordActivity({ actorId: admin.context.user.id, action: "scheduled_automation.created", entityType: "scheduled_automations", entityId: rule.id, metadata: { condition: rule.condition_key } });
    return jsonOk({ scheduledAutomation: rule }, 201);
  } catch (error) {
    return handleDbError("admin/scheduled-automations", error);
  }
}
