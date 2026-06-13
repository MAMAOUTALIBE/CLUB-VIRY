import type { NextRequest } from "next/server";

import { getEducatorContext } from "@/lib/api/educator-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import type { CallupStatus } from "@/lib/db/sessions";
import { getMatchCallupsForEducator, setMatchCallupsForEducator } from "@/lib/db/sessions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: CallupStatus[] = ["CONVOQUE", "REMPLACANT", "NON_CONVOQUE", "BLESSE"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const educator = await getEducatorContext(request);

  if (!educator.ok) {
    return educator.response;
  }

  const { id } = await context.params;

  try {
    const callups = await getMatchCallupsForEducator(id, educator.context.user.id, educator.context.canManageAllTeams);

    if (callups === null) {
      return jsonError(404, "NOT_FOUND", "Match introuvable ou non autorise.");
    }

    return jsonOk({ callups });
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
  const rawEntries = body && typeof body === "object" ? (body as Record<string, unknown>).entries : undefined;

  if (!Array.isArray(rawEntries)) {
    return jsonError(400, "VALIDATION_ERROR", "Le corps doit contenir un tableau 'entries'.");
  }

  const entries: Array<{ playerId: string; status: CallupStatus }> = [];
  for (const item of rawEntries) {
    const playerId = item && typeof item === "object" ? (item as Record<string, unknown>).playerId : undefined;
    const status = item && typeof item === "object" ? (item as Record<string, unknown>).status : undefined;
    if (typeof playerId !== "string" || !UUID_RE.test(playerId) || typeof status !== "string" || !STATUSES.includes(status as CallupStatus)) {
      return jsonError(400, "VALIDATION_ERROR", "Entree de convocation invalide (playerId / status).");
    }
    entries.push({ playerId, status: status as CallupStatus });
  }

  const { id } = await context.params;

  try {
    const callups = await setMatchCallupsForEducator(id, educator.context.user.id, educator.context.canManageAllTeams, entries);

    if (callups === null) {
      return jsonError(404, "NOT_FOUND", "Match introuvable ou non autorise.");
    }

    return jsonOk({ callups });
  } catch (error) {
    return handleDbError("educator/matches/[id]/callups", error);
  }
}
