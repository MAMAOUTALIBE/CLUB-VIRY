import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminTeamStaffPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { addTeamStaff, getEducatorTeamRoster, isLinkableEducatorProfile } from "@/lib/db/teams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "teams:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  try {
    const roster = await getEducatorTeamRoster(id, admin.context.user.id, true);

    if (!roster) {
      return jsonError(404, "NOT_FOUND", "Equipe introuvable.");
    }

    return jsonOk({ staff: roster.staff });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur staff equipe inconnue.");
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
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

  if (payload.data.profileId && !(await isLinkableEducatorProfile(payload.data.profileId))) {
    return jsonError(400, "VALIDATION_ERROR", "Le compte a rattacher doit exister et avoir le role Educateur.", [
      { field: "profileId", message: "Compte educateur introuvable." }
    ]);
  }

  const { id } = await context.params;

  try {
    const staff = await addTeamStaff(id, payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "team.staff.added",
      entityType: "team_staff",
      entityId: staff.id,
      metadata: { teamId: id, displayName: staff.display_name, roleTitle: staff.role_title }
    });

    return jsonOk({ staff }, 201);
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur ajout staff equipe inconnue.");
  }
}
