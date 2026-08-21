import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminTeamPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { updateTeam } from "@/lib/db/teams";
import { softDeleteRow } from "@/lib/db/soft-delete";

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

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "teams:manage");
  if (!admin.ok) return admin.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  try {
    if (!await softDeleteRow("teams", id, admin.context.user.id)) return jsonError(404, "NOT_FOUND", "Équipe introuvable.");
    await recordActivity({ actorId: admin.context.user.id, action: "team.trashed", entityType: "teams", entityId: id });
    return jsonOk({ trashed: true });
  } catch (error) { return handleDbError("admin/teams/[id] DELETE", error); }
}
