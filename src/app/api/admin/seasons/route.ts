import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, parseLimit, readJsonBody } from "@/lib/api/http";
import { validateAdminSeasonPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { createSeason, listSeasonsForAdmin } from "@/lib/db/seasons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "teams:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 50, 200);

  try {
    return jsonOk({ seasons: await listSeasonsForAdmin(limit) });
  } catch (error) {
    return handleDbError("admin/seasons", error);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "teams:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  }

  const payload = validateAdminSeasonPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Saison invalide.", payload.issues);
  }

  try {
    const season = await createSeason(payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "season.created",
      entityType: "seasons",
      entityId: season.id,
      metadata: { name: season.name, isActive: season.is_active }
    });

    return jsonOk({ season }, 201);
  } catch (error) {
    return handleDbError("admin/seasons", error);
  }
}
