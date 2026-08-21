import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminRecruitmentReviewPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { reviewRecruitmentApplication } from "@/lib/db/recruitment-shop";
import { softDeleteRow } from "@/lib/db/soft-delete";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "players:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminRecruitmentReviewPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Candidature detection invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const application = await reviewRecruitmentApplication(id, payload.data);

    if (!application) {
      return jsonError(404, "NOT_FOUND", "Candidature introuvable ou archivee.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: payload.data.assignedTo !== undefined ? "recruitment.application.assigned" : "recruitment.application.reviewed",
      entityType: "recruitment_applications",
      entityId: application.id,
      metadata: {
        playerName: `${application.first_name} ${application.last_name}`,
        status: application.status,
        assignedTo: application.assigned_to ?? null
      }
    });

    return jsonOk({ application });
  } catch (error) {
    return handleDbError("admin/recruitment/applications/[id]", error);
  }
}

/** Archive une candidature (corbeille) : doublons, tests et candidatures hors sujet. */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "players:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  if (!isUuid(id)) {
    return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  }

  try {
    const trashed = await softDeleteRow("recruitment", id, admin.context.user.id);

    if (!trashed) {
      return jsonError(404, "NOT_FOUND", "Candidature introuvable.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "recruitment.application.trashed",
      entityType: "recruitment_applications",
      entityId: id
    });

    return jsonOk({ trashed: true });
  } catch (error) {
    return handleDbError("admin/recruitment/applications/[id]", error);
  }
}
