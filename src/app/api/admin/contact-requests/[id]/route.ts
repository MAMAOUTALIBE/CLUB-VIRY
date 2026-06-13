import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminContactMessageReviewPayload } from "@/lib/api/validation";
import { reviewContactMessage } from "@/lib/db/contact-admin";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "admin:access");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminContactMessageReviewPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Message contact invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const message = await reviewContactMessage(id, payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "contact_message.reviewed",
      entityType: "contact_messages",
      entityId: message.id,
      metadata: {
        subject: message.subject,
        status: message.status,
        assignedTo: message.assigned_to
      }
    });

    return jsonOk({ message });
  } catch (error) {
    return handleDbError("admin/contact-requests/[id]", error);
  }
}
