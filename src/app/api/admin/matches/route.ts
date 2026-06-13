import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminMatchPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { createMatch, listMatches } from "@/lib/db/teams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "matches:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 50) || 50, 100);

  try {
    const matches = await listMatches(limit);
    return jsonOk({ matches });
  } catch (error) {
    return handleDbError("admin/matches", error);
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

  const payload = validateAdminMatchPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Match invalide.", payload.issues);
  }

  try {
    const match = await createMatch(payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "match.created",
      entityType: "matches",
      entityId: match.id,
      metadata: { opponentName: match.opponent_name, startsAt: match.starts_at }
    });

    return jsonOk({ match }, 201);
  } catch (error) {
    return handleDbError("admin/matches", error);
  }
}
