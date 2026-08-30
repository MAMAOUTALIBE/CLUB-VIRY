import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { isSameOriginRequest } from "@/lib/api/origin";
import { detectPrivateMediaMimeType, validatePrivateMediaUploadPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "family-media";
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_MULTIPART_SIZE = MAX_FILE_SIZE + 1024 * 1024;
const EXTENSION_BY_MIME = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm"
} as const;

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "admin:family-media-upload", { max: 60, windowMs: 60_000 });
  if (!rateLimit.allowed) return jsonError(429, "RATE_LIMITED", "Trop de demandes. Réessayez dans quelques instants.");
  if (!isSameOriginRequest(request)) return jsonError(403, "FORBIDDEN", "Origine de requête refusée.");

  const admin = await getAdminContext(request, "content:manage");
  if (!admin.ok) return admin.response;

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_MULTIPART_SIZE) {
    return jsonError(413, "VALIDATION_ERROR", "Le fichier dépasse la taille maximale autorisée de 100 Mo.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError(400, "VALIDATION_ERROR", "Requête invalide (multipart attendu).");
  }

  const file = form.get("file");
  if (!(file instanceof File)) return jsonError(400, "VALIDATION_ERROR", "Fichier privé manquant.");
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return jsonError(413, "VALIDATION_ERROR", "Le fichier dépasse la taille maximale autorisée de 100 Mo.");
  }

  const payload = validatePrivateMediaUploadPayload({
    fileName: file.name,
    contentType: file.type,
    teamId: form.get("teamId")
  });
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Fichier privé invalide.", payload.issues);

  const detectedContentType = detectPrivateMediaMimeType(new Uint8Array(await file.slice(0, 16).arrayBuffer()));
  if (!detectedContentType || detectedContentType !== payload.data.contentType) {
    return jsonError(400, "VALIDATION_ERROR", "Le contenu du fichier ne correspond pas à son type déclaré.");
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id")
      .eq("id", payload.data.teamId)
      .is("deleted_at", null)
      .maybeSingle();
    if (teamError) throw new Error(`Unable to validate private upload team: ${teamError.message}`);
    if (!team) return jsonError(400, "VALIDATION_ERROR", "Équipe introuvable.");

    const extension = EXTENSION_BY_MIME[detectedContentType];
    const year = new Date().getUTCFullYear();
    const storagePath = `${payload.data.teamId}/${year}/${randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { contentType: detectedContentType, cacheControl: "0", upsert: false });

    if (error) throw new Error(`Unable to upload private media: ${error.message}`);

    await recordActivity({
      actorId: admin.context.user.id,
      action: "media.private_upload_authorized",
      entityType: "media_assets",
      metadata: { teamId: payload.data.teamId, contentType: detectedContentType, size: file.size, storagePath }
    });

    const response = jsonOk({ storagePath }, 201);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return handleDbError("admin/media/private-upload", error);
  }
}
