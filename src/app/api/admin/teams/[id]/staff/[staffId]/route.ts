import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminTeamStaffPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { removeTeamStaff, updateTeamStaff } from "@/lib/db/teams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
    staffId: string;
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

  const payload = validateAdminTeamStaffPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Staff equipe invalide.", payload.issues);
  }

  const { id, staffId } = await context.params;

  try {
    const staff = await updateTeamStaff(staffId, payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "team.staff.updated",
      entityType: "team_staff",
      entityId: staffId,
      metadata: { teamId: id, displayName: staff.display_name, roleTitle: staff.role_title }
    });

    return jsonOk({ staff });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur mise a jour staff equipe inconnue.");
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "teams:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id, staffId } = await context.params;

  try {
    await removeTeamStaff(staffId);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "team.staff.removed",
      entityType: "team_staff",
      entityId: staffId,
      metadata: { teamId: id, staffId }
    });

    return jsonOk({ removed: true });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur suppression staff equipe inconnue.");
  }
}
