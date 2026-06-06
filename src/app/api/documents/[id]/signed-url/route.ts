import type { NextRequest } from "next/server";

import { jsonError, jsonOk } from "@/lib/api/http";
import { hasPermission } from "@/lib/auth";
import { getAuthContext } from "@/lib/auth/session";
import { recordActivity } from "@/lib/db/foundations";
import { createRegistrationDocumentSignedUrl } from "@/lib/db/registrations";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await getAuthContext(request);

  if (!auth.ok) {
    return jsonError(auth.status, auth.code, auth.message);
  }

  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  const { id } = await context.params;

  if (!uuidPattern.test(id)) {
    return jsonError(400, "VALIDATION_ERROR", "Identifiant document invalide.");
  }

  const canReviewDocuments = auth.context.profile ? hasPermission(auth.context.profile.role, "documents:review") : false;

  try {
    const document = await createRegistrationDocumentSignedUrl(auth.context.user.id, id, canReviewDocuments);

    if (!document) {
      return jsonError(404, "NOT_FOUND", "Document introuvable ou inaccessible.");
    }

    await recordActivity({
      actorId: auth.context.user.id,
      action: "registration_document.signed_url_created",
      entityType: "registration_documents",
      entityId: document.document.id,
      metadata: {
        registrationId: document.document.registration_id,
        documentType: document.document.document_type,
        canReviewDocuments
      },
      userAgent: request.headers.get("user-agent")
    });

    return jsonOk({
      document: {
        ...document.document,
        file_path: null
      },
      signedUrl: document.signedUrl,
      expiresIn: document.expiresIn
    });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur lien document inconnue.");
  }
}
