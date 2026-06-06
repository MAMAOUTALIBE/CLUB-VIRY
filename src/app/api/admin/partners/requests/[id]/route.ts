import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminPartnershipRequestReviewPayload } from "@/lib/api/validation";
import { reviewPartnershipRequest } from "@/lib/db/content";
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

  const payload = validateAdminPartnershipRequestReviewPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Demande partenaire invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const requestRecord = await reviewPartnershipRequest(id, payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "partnership_request.reviewed",
      entityType: "partnership_requests",
      entityId: requestRecord.id,
      metadata: {
        companyName: requestRecord.company_name,
        status: requestRecord.status
      }
    });

    return jsonOk({ request: requestRecord });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur traitement demande partenaire inconnue.");
  }
}
