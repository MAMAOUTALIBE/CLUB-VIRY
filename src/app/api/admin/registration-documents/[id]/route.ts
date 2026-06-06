import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminDocumentReviewPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { reviewRegistrationDocument } from "@/lib/db/registrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "documents:review");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminDocumentReviewPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Revue de document invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const document = await reviewRegistrationDocument(id, payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "registration_document.reviewed",
      entityType: "registration_documents",
      entityId: document.id,
      metadata: { status: document.status, registrationId: document.registration_id }
    });

    return jsonOk({ document });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur revue document inconnue.");
  }
}
