import type { NextRequest } from "next/server";

import { getEducatorContext } from "@/lib/api/educator-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { recordActivity } from "@/lib/db/foundations";
import { createTrainingSessionForEducator, listTrainingSessionsForEducator } from "@/lib/db/sessions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const educator = await getEducatorContext(request);

  if (!educator.ok) {
    return educator.response;
  }

  const { id } = await context.params;

  try {
    const sessions = await listTrainingSessionsForEducator(id, educator.context.user.id, educator.context.canManageAllTeams);

    if (sessions === null) {
      return jsonError(404, "NOT_FOUND", "Equipe introuvable ou non autorisee.");
    }

    return jsonOk({ sessions });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur seances inconnue.");
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const educator = await getEducatorContext(request);

  if (!educator.ok) {
    return educator.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined || typeof body !== "object" || body === null) {
    return jsonError(400, "INVALID_JSON", "Le corps doit etre un objet JSON.");
  }

  const b = body as Record<string, unknown>;
  const startsAt = typeof b.startsAt === "string" ? b.startsAt.trim() : "";
  if (!startsAt || Number.isNaN(new Date(startsAt).getTime())) {
    return jsonError(400, "VALIDATION_ERROR", "Date de seance invalide.", [{ field: "startsAt", message: "Date requise." }]);
  }
  const durationMin = typeof b.durationMin === "number" && Number.isInteger(b.durationMin) && b.durationMin > 0 && b.durationMin <= 600 ? b.durationMin : null;
  const location = typeof b.location === "string" && b.location.trim() ? b.location.trim().slice(0, 200) : null;
  const theme = typeof b.theme === "string" && b.theme.trim() ? b.theme.trim().slice(0, 200) : null;
  const notes = typeof b.notes === "string" && b.notes.trim() ? b.notes.trim().slice(0, 2000) : null;

  const { id } = await context.params;

  try {
    const session = await createTrainingSessionForEducator(educator.context.user.id, educator.context.canManageAllTeams, {
      teamId: id,
      startsAt,
      durationMin,
      location,
      theme,
      notes
    });

    if (!session) {
      return jsonError(404, "NOT_FOUND", "Equipe introuvable ou non autorisee.");
    }

    await recordActivity({
      actorId: educator.context.user.id,
      action: "educator.session.created",
      entityType: "training_sessions",
      entityId: session.id,
      metadata: { teamId: id, startsAt: session.starts_at }
    });

    return jsonOk({ session }, 201);
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur creation seance inconnue.");
  }
}
