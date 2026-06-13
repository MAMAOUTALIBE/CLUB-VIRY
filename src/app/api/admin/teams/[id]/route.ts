import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminTeamPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { updateTeam } from "@/lib/db/teams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "teams:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminTeamPayload(body, { partial: true });

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Equipe invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const team = await updateTeam(id, payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "team.updated",
      entityType: "teams",
      entityId: team.id,
      metadata: { name: team.name, slug: team.slug, isActive: team.is_active }
    });

    return jsonOk({ team });
  } catch (error) {
    return handleDbError("admin/teams/[id]", error);
  }
}
