import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, parseLimit, readJsonBody } from "@/lib/api/http";
import { validateAdminPlayerCreatePayload } from "@/lib/api/validation";
import { createPlayerForAdmin, listPlayersForAdmin } from "@/lib/db/family";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "players:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 100, 2000);

  try {
    const payload = await listPlayersForAdmin(limit);
    return jsonOk(payload);
  } catch (error) {
    return handleDbError("admin/players", error);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "players:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  }

  const payload = validateAdminPlayerCreatePayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Fiche joueur invalide.", payload.issues);
  }

  try {
    const player = await createPlayerForAdmin({ ...payload.data, createdBy: admin.context.user.id });

    await recordActivity({
      actorId: admin.context.user.id,
      action: "player.created",
      entityType: "players",
      entityId: player.id,
      metadata: { firstName: player.first_name, lastName: player.last_name }
    });

    return jsonOk({ player });
  } catch (error) {
    return handleDbError("admin/players", error);
  }
}
