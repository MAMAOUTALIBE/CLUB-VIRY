import type { NextRequest } from "next/server";

import { handleDbError, jsonError } from "@/lib/api/http";
import { hasPermission } from "@/lib/auth";
import { getAuthContext } from "@/lib/auth/session";
import { recordActivity } from "@/lib/db/foundations";
import { downloadRegistrationDocumentFile } from "@/lib/db/registrations";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// Préfixe UUID v4 ajouté au nom de fichier à l'upload : on le retire pour
// retrouver le nom original lisible.
const uploadPrefixPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i;

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp"
};

function deriveFileName(filePath: string): string {
  const base = filePath.split("/").pop() ?? "document";
  const name = base.replace(uploadPrefixPattern, "");
  // Anti-injection d'en-tête : on neutralise guillemets et retours ligne.
  return (name || "document").replace(/["\r\n]/g, "_");
}

// Proxy de téléchargement : Supabase étant interne, le navigateur ne peut pas
// joindre une URL signée. Cette route authentifie l'utilisateur (cookie HttpOnly
// `admin_session` lors d'une navigation, ou Bearer), revérifie l'accès, puis
// streame le fichier depuis le storage interne.
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
    const result = await downloadRegistrationDocumentFile(auth.context.user.id, id, canReviewDocuments);

    if (!result) {
      return jsonError(404, "NOT_FOUND", "Document introuvable ou inaccessible.");
    }

    await recordActivity({
      actorId: auth.context.user.id,
      action: "registration_document.downloaded",
      entityType: "registration_documents",
      entityId: result.document.id,
      metadata: {
        registrationId: result.document.registration_id,
        documentType: result.document.document_type,
        canReviewDocuments
      },
      userAgent: request.headers.get("user-agent")
    });

    const arrayBuffer = await result.blob.arrayBuffer();
    const fileName = deriveFileName(result.document.file_path as string);
    const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
    const contentType = result.blob.type || MIME_BY_EXTENSION[extension] || "application/octet-stream";

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(arrayBuffer.byteLength),
        "Cache-Control": "private, no-store"
      }
    });
  } catch (error) {
    return handleDbError("documents/[id]/download", error);
  }
}
