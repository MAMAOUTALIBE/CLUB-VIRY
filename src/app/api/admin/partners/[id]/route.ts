import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminPartnerPayload } from "@/lib/api/validation";
import { updatePartner } from "@/lib/db/content";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "partners:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminPartnerPayload(body, { partial: true });

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Partenaire invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const partner = await updatePartner(id, payload.data);

    if (!partner) {
      return jsonError(404, "NOT_FOUND", "Partenaire introuvable.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "partner.updated",
      entityType: "partners",
      entityId: partner.id,
      metadata: { name: partner.name, slug: partner.slug, isActive: partner.is_active }
    });

    return jsonOk({ partner });
  } catch (error) {
    return handleDbError("admin/partners/[id]", error);
  }
}
