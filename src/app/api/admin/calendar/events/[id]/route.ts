import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminEventPayload } from "@/lib/api/validation";
import { updateEvent } from "@/lib/db/calendar";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "matches:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminEventPayload(body, { partial: true });

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Evenement invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const event = await updateEvent(id, payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "calendar.event.updated",
      entityType: "club_events",
      entityId: event.id,
      metadata: {
        title: event.title,
        startsAt: event.starts_at,
        visibility: event.visibility
      }
    });

    return jsonOk({ event });
  } catch (error) {
    return handleDbError("admin/calendar/events/[id]", error);
  }
}
