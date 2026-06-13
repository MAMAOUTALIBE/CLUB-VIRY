import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminEventPayload } from "@/lib/api/validation";
import { createEvent, listEventsForAdmin } from "@/lib/db/calendar";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getDateParam(value: string | null): string | undefined {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    return undefined;
  }

  return value;
}

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "matches:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 100) || 100, 500);
  const from = getDateParam(request.nextUrl.searchParams.get("from"));
  const to = getDateParam(request.nextUrl.searchParams.get("to"));

  try {
    const events = await listEventsForAdmin({ limit, from, to });
    return jsonOk({ events });
  } catch (error) {
    return handleDbError("admin/calendar/events", error);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "matches:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminEventPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Evenement invalide.", payload.issues);
  }

  try {
    const event = await createEvent(payload.data, admin.context.user.id);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "calendar.event.created",
      entityType: "club_events",
      entityId: event.id,
      metadata: {
        title: event.title,
        startsAt: event.starts_at,
        visibility: event.visibility
      }
    });

    return jsonOk({ event }, 201);
  } catch (error) {
    return handleDbError("admin/calendar/events", error);
  }
}
