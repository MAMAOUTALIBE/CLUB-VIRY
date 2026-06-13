import type { NextRequest } from "next/server";

import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { validateDocumentUploadPayload } from "@/lib/api/validation";
import { getAuthContext } from "@/lib/auth/session";
import { getRegistrationForProfile, markRegistrationDocumentUploaded } from "@/lib/db/registrations";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOCUMENTS_BUCKET = "club-documents";
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

/**
 * V\u00e9rifie la signature binaire (magic bytes) r\u00e9elle du fichier, et pas seulement
 * le Content-Type d\u00e9clar\u00e9 par le client (falsifiable). Emp\u00eache le stockage d'un
 * contenu malveillant (HTML/SVG/script, ex\u00e9cutable) d\u00e9guis\u00e9 en PDF/image, qui
 * serait ensuite re-servi via une URL sign\u00e9e.
 */
async function hasValidSignature(file: File): Promise<boolean> {
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const startsWith = (...bytes: number[]) => bytes.every((byte, index) => header[index] === byte);

  switch (file.type) {
    case "application/pdf":
      return startsWith(0x25, 0x50, 0x44, 0x46); // %PDF
    case "image/jpeg":
      return startsWith(0xff, 0xd8, 0xff);
    case "image/png":
      return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    case "image/webp":
      // "RIFF" .... "WEBP"
      return startsWith(0x52, 0x49, 0x46, 0x46) && header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50;
    default:
      return false;
  }
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "documents:upload", { max: 12, windowMs: 60_000 });

  if (!rateLimit.allowed) {
    return jsonError(429, "RATE_LIMITED", "Trop de tentatives. Reessayez dans quelques instants.");
  }

  const auth = await getAuthContext(request);

  if (!auth.ok) {
    return jsonError(auth.status, auth.code, auth.message);
  }

  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const payload = validateDocumentUploadPayload({
    registrationId: formData.get("registrationId"),
    documentType: formData.get("documentType")
  });

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Upload invalide.", payload.issues);
  }

  if (!(file instanceof File)) {
    return jsonError(400, "VALIDATION_ERROR", "Fichier manquant.");
  }

  if (file.size > MAX_FILE_SIZE) {
    return jsonError(400, "VALIDATION_ERROR", "Le fichier depasse la taille maximale autorisee.");
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return jsonError(400, "VALIDATION_ERROR", "Type de fichier non autorise.");
  }

  if (!(await hasValidSignature(file))) {
    return jsonError(400, "VALIDATION_ERROR", "Le contenu du fichier ne correspond pas a son type declare.");
  }

  try {
    const registration = await getRegistrationForProfile(auth.context.user.id, payload.data.registrationId);

    if (!registration) {
      return jsonError(404, "NOT_FOUND", "Dossier introuvable ou inaccessible.");
    }

    const expectedDocument = registration.documents.find((document) => document.document_type === payload.data.documentType);

    if (!expectedDocument) {
      return jsonError(404, "NOT_FOUND", "Document attendu introuvable pour ce dossier.");
    }

    const filePath = [
      "registrations",
      payload.data.registrationId,
      payload.data.documentType,
      `${crypto.randomUUID()}-${sanitizeFileName(file.name || "document")}`
    ].join("/");

    const { error: uploadError } = await getSupabaseAdminClient().storage.from(DOCUMENTS_BUCKET).upload(filePath, file, {
      contentType: file.type,
      upsert: false
    });

    if (uploadError) {
      return jsonError(500, "SUPABASE_ERROR", uploadError.message);
    }

    const document = await markRegistrationDocumentUploaded({
      documentId: expectedDocument.id,
      filePath,
      uploadedBy: auth.context.user.id
    });

    return jsonOk({ document }, 201);
  } catch (error) {
    return handleDbError("documents/upload", error);
  }
}
