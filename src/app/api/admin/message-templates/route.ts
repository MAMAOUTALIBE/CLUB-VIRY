import type { NextRequest } from "next/server";
import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminMessageTemplatePayload } from "@/lib/api/validation";
import { createMessageTemplate, listMessageTemplates } from "@/lib/db/messaging";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "communication:manage");
  if (!admin.ok) return admin.response;
  try {
    return jsonOk({ messageTemplates: await listMessageTemplates() });
  } catch (error) {
    return handleDbError("admin/message-templates", error);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "communication:manage");
  if (!admin.ok) return admin.response;
  const body = await readJsonBody(request);
  if (body === undefined) return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  const payload = validateAdminMessageTemplatePayload(body);
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Modèle invalide.", payload.issues);
  try {
    const template = await createMessageTemplate(payload.data);
    await recordActivity({ actorId: admin.context.user.id, action: "message_template.created", entityType: "message_templates", entityId: template.id, metadata: { key: template.key, channel: template.channel } });
    return jsonOk({ messageTemplate: template }, 201);
  } catch (error) {
    return handleDbError("admin/message-templates", error);
  }
}
