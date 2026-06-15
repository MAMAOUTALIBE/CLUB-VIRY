import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, parseLimit, readJsonBody } from "@/lib/api/http";
import { validateAdminTeamPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { createTeam, listTeamsForAdmin } from "@/lib/db/teams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "teams:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 100, 500);

  try {
    const teams = await listTeamsForAdmin(limit);
    return jsonOk({ teams });
  } catch (error) {
    return handleDbError("admin/teams", error);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "teams:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminTeamPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Equipe invalide.", payload.issues);
  }

  try {
    const team = await createTeam(payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "team.created",
      entityType: "teams",
      entityId: team.id,
      metadata: { name: team.name, slug: team.slug }
    });

    return jsonOk({ team }, 201);
  } catch (error) {
    return handleDbError("admin/teams", error);
  }
}
