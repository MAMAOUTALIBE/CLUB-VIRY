import type { NextRequest } from "next/server";

import { getEducatorContext } from "@/lib/api/educator-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import type { CallupPresenceStatus, CallupResponseStatus, CallupStatus, MatchConvocationInput } from "@/lib/db/sessions";
import { getMatchCallupDetailForEducator, setMatchCallupsForEducator } from "@/lib/db/sessions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: CallupStatus[] = ["CONVOQUE", "REMPLACANT", "NON_CONVOQUE", "ABSENT", "BLESSE", "SUSPENDU", "A_CONFIRMER"];
const RESPONSE_STATUSES: CallupResponseStatus[] = ["EN_ATTENTE", "PRESENT", "ABSENT", "RETARD"];
const PRESENCE_STATUSES: CallupPresenceStatus[] = ["NON_SAISI", "PRESENT", "ABSENT", "RETARD", "EXCUSE"];
const CONVOCATION_STATUSES = ["DRAFT", "SENT", "CLOSED", "CANCELLED"] as const;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const educator = await getEducatorContext(request);

  if (!educator.ok) {
    return educator.response;
  }

  const { id } = await context.params;

  try {
    const detail = await getMatchCallupDetailForEducator(id, educator.context.user.id, educator.context.canManageAllTeams);

    if (detail === null) {
      return jsonError(404, "NOT_FOUND", "Match introuvable ou non autorise.");
    }

    return jsonOk(detail);
  } catch (error) {
    return handleDbError("educator/matches/[id]/callups", error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const educator = await getEducatorContext(request);

  if (!educator.ok) {
    return educator.response;
  }

  const body = await readJsonBody(request);
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const rawEntries = record.entries;
  const rawConvocation = record.convocation;

  if (!Array.isArray(rawEntries)) {
    return jsonError(400, "VALIDATION_ERROR", "Le corps doit contenir un tableau 'entries'.");
  }

  const entries: Array<{
    playerId: string;
    status: CallupStatus;
    responseStatus?: CallupResponseStatus;
    responseComment?: string | null;
    presenceStatus?: CallupPresenceStatus;
    presenceComment?: string | null;
  }> = [];
  for (const item of rawEntries) {
    const entry = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const playerId = entry.playerId;
    const status = entry.status;
    const responseStatus = entry.responseStatus;
    const responseComment = entry.responseComment;
    const presenceStatus = entry.presenceStatus;
    const presenceComment = entry.presenceComment;
    if (typeof playerId !== "string" || !UUID_RE.test(playerId) || typeof status !== "string" || !STATUSES.includes(status as CallupStatus)) {
      return jsonError(400, "VALIDATION_ERROR", "Entree de convocation invalide (playerId / status).");
    }
    if (responseStatus !== undefined && (typeof responseStatus !== "string" || !RESPONSE_STATUSES.includes(responseStatus as CallupResponseStatus))) {
      return jsonError(400, "VALIDATION_ERROR", "Statut de reponse invalide.");
    }
    if (presenceStatus !== undefined && (typeof presenceStatus !== "string" || !PRESENCE_STATUSES.includes(presenceStatus as CallupPresenceStatus))) {
      return jsonError(400, "VALIDATION_ERROR", "Statut de presence invalide.");
    }
    if (responseComment !== undefined && responseComment !== null && typeof responseComment !== "string") {
      return jsonError(400, "VALIDATION_ERROR", "Commentaire de reponse invalide.");
    }
    if (presenceComment !== undefined && presenceComment !== null && typeof presenceComment !== "string") {
      return jsonError(400, "VALIDATION_ERROR", "Commentaire de presence invalide.");
    }
    entries.push({
      playerId,
      status: status as CallupStatus,
      ...(responseStatus ? { responseStatus: responseStatus as CallupResponseStatus } : {}),
      ...(typeof responseComment === "string" || responseComment === null ? { responseComment } : {}),
      ...(presenceStatus ? { presenceStatus: presenceStatus as CallupPresenceStatus } : {}),
      ...(typeof presenceComment === "string" || presenceComment === null ? { presenceComment } : {})
    });
  }

  let convocation: MatchConvocationInput | undefined;
  if (rawConvocation !== undefined) {
    if (!rawConvocation || typeof rawConvocation !== "object") {
      return jsonError(400, "VALIDATION_ERROR", "Fiche convocation invalide.");
    }
    const c = rawConvocation as Record<string, unknown>;
    const status = c.status;
    if (status !== undefined && (typeof status !== "string" || !CONVOCATION_STATUSES.includes(status as (typeof CONVOCATION_STATUSES)[number]))) {
      return jsonError(400, "VALIDATION_ERROR", "Statut de fiche convocation invalide.");
    }
    const eventTypeId = c.eventTypeId;
    if (eventTypeId !== undefined && eventTypeId !== null && (typeof eventTypeId !== "string" || !UUID_RE.test(eventTypeId))) {
      return jsonError(400, "VALIDATION_ERROR", "Type d'evenement invalide.");
    }
    const stringOrNullFields = [
      "customEventTypeName",
      "meetingAt",
      "meetingLocation",
      "eventLocation",
      "returnEstimateAt",
      "instructions",
      "outfit",
      "transport",
      "coachComment",
      "impedimentContact"
    ] as const;
    for (const key of stringOrNullFields) {
      const value = c[key];
      if (value !== undefined && value !== null && typeof value !== "string") {
        return jsonError(400, "VALIDATION_ERROR", `Champ convocation invalide : ${key}.`);
      }
    }
    convocation = {
      ...(typeof eventTypeId === "string" || eventTypeId === null ? { eventTypeId } : {}),
      ...(typeof c.customEventTypeName === "string" || c.customEventTypeName === null ? { customEventTypeName: c.customEventTypeName } : {}),
      ...(typeof c.meetingAt === "string" || c.meetingAt === null ? { meetingAt: c.meetingAt } : {}),
      ...(typeof c.meetingLocation === "string" || c.meetingLocation === null ? { meetingLocation: c.meetingLocation } : {}),
      ...(typeof c.eventLocation === "string" || c.eventLocation === null ? { eventLocation: c.eventLocation } : {}),
      ...(typeof c.returnEstimateAt === "string" || c.returnEstimateAt === null ? { returnEstimateAt: c.returnEstimateAt } : {}),
      ...(typeof c.instructions === "string" || c.instructions === null ? { instructions: c.instructions } : {}),
      ...(typeof c.outfit === "string" || c.outfit === null ? { outfit: c.outfit } : {}),
      ...(typeof c.transport === "string" || c.transport === null ? { transport: c.transport } : {}),
      ...(typeof c.coachComment === "string" || c.coachComment === null ? { coachComment: c.coachComment } : {}),
      ...(typeof c.impedimentContact === "string" || c.impedimentContact === null ? { impedimentContact: c.impedimentContact } : {}),
      ...(typeof status === "string" ? { status: status as MatchConvocationInput["status"] } : {})
    };
  }

  const { id } = await context.params;

  try {
    const detail = await setMatchCallupsForEducator(id, educator.context.user.id, educator.context.canManageAllTeams, entries, convocation);

    if (detail === null) {
      return jsonError(404, "NOT_FOUND", "Match introuvable ou non autorise.");
    }

    return jsonOk(detail);
  } catch (error) {
    return handleDbError("educator/matches/[id]/callups", error);
  }
}
