import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { isUuid } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { softDeleteRow } from "@/lib/db/soft-delete";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/** Archive une campagne (corbeille) : un brouillon abandonné ou un envoi à ranger. */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "communication:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  if (!isUuid(id)) {
    return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  }

  try {
    const trashed = await softDeleteRow("campaigns", id, admin.context.user.id);

    if (!trashed) {
      return jsonError(404, "NOT_FOUND", "Campagne introuvable.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "campaign.trashed",
      entityType: "communication_campaigns",
      entityId: id
    });

    return jsonOk({ trashed: true });
  } catch (error) {
    return handleDbError("admin/campaigns/[id]", error);
  }
}
