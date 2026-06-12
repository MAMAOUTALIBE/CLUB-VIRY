import type { NextRequest } from "next/server";

import { getEducatorContext } from "@/lib/api/educator-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import type { AttendanceStatus } from "@/lib/db/sessions";
import { getSessionAttendanceForEducator, setSessionAttendanceForEducator } from "@/lib/db/sessions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: AttendanceStatus[] = ["PRESENT", "ABSENT", "EXCUSE", "BLESSE"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const educator = await getEducatorContext(request);

  if (!educator.ok) {
    return educator.response;
  }

  const { sessionId } = await context.params;

  try {
    const attendance = await getSessionAttendanceForEducator(sessionId, educator.context.user.id, educator.context.canManageAllTeams);

    if (attendance === null) {
      return jsonError(404, "NOT_FOUND", "Seance introuvable ou non autorisee.");
    }

    return jsonOk({ attendance });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur presences inconnue.");
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const educator = await getEducatorContext(request);

  if (!educator.ok) {
    return educator.response;
  }

  const body = await readJsonBody(request);
  const rawEntries = body && typeof body === "object" ? (body as Record<string, unknown>).entries : undefined;

  if (!Array.isArray(rawEntries)) {
    return jsonError(400, "VALIDATION_ERROR", "Le corps doit contenir un tableau 'entries'.");
  }

  const entries: Array<{ playerId: string; status: AttendanceStatus }> = [];
  for (const item of rawEntries) {
    const playerId = item && typeof item === "object" ? (item as Record<string, unknown>).playerId : undefined;
    const status = item && typeof item === "object" ? (item as Record<string, unknown>).status : undefined;
    if (typeof playerId !== "string" || !UUID_RE.test(playerId) || typeof status !== "string" || !STATUSES.includes(status as AttendanceStatus)) {
      return jsonError(400, "VALIDATION_ERROR", "Entree de presence invalide (playerId / status).");
    }
    entries.push({ playerId, status: status as AttendanceStatus });
  }

  const { sessionId } = await context.params;

  try {
    const attendance = await setSessionAttendanceForEducator(sessionId, educator.context.user.id, educator.context.canManageAllTeams, entries);

    if (attendance === null) {
      return jsonError(404, "NOT_FOUND", "Seance introuvable ou non autorisee.");
    }

    return jsonOk({ attendance });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur enregistrement presences inconnue.");
  }
}
