import type { NextRequest } from "next/server";

import { jsonError, jsonOk } from "@/lib/api/http";
import { getEducatorContext } from "@/lib/api/educator-auth";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PHOTO_BUCKET = "educator-photos";
const MAX_BYTES = 2 * 1024 * 1024;

// Détecte le type RÉEL via les magic bytes (on NE fait PAS confiance à file.type
// fourni par le client : un SVG/HTML/polyglot pourrait sinon être servi).
function sniffImageType(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && // RIFF
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50 // WEBP
  ) {
    return "image/webp";
  }
  return null;
}

// Upload de la photo de profil par l'éducateur. Stockée dans un bucket privé ;
// avatar_url pointe vers le proxy /api/media/educator/[id] (Supabase non exposé).
export async function POST(request: NextRequest) {
  const ctx = await getEducatorContext(request);
  if (!ctx.ok) {
    return ctx.response;
  }

  const rateLimit = checkRateLimit(request, "educator:photo", { max: 6, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return jsonError(429, "RATE_LIMITED", "Trop d'envois. Reessayez dans un instant.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError(400, "VALIDATION_ERROR", "Requete invalide (multipart attendu).");
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonError(400, "VALIDATION_ERROR", "Fichier manquant.");
  }
  if (file.size > MAX_BYTES) {
    return jsonError(400, "VALIDATION_ERROR", "Image trop lourde (2 Mo maximum).");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = sniffImageType(bytes);
  if (!detected) {
    return jsonError(400, "VALIDATION_ERROR", "Fichier image invalide : JPEG, PNG ou WebP attendu.");
  }

  const userId = ctx.context.user.id;
  const ext = detected === "image/png" ? "png" : detected === "image/webp" ? "webp" : "jpg";
  const path = `educators/${userId}/avatar-${crypto.randomUUID()}.${ext}`;
  const supabase = getSupabaseAdminClient();

  // On upload les octets sniffés avec le contentType DÉTECTÉ (pas celui du client).
  const { error: uploadError } = await supabase.storage.from(PHOTO_BUCKET).upload(path, bytes, {
    contentType: detected,
    upsert: false
  });
  if (uploadError) {
    console.error("[api] educator/profile/photo storage upload", uploadError);
    return jsonError(500, "SUPABASE_ERROR", "Une erreur interne est survenue. Réessayez plus tard.");
  }

  const previousPath = ctx.context.profile?.avatar_path ?? null;
  const avatarUrl = `/api/media/educator/${userId}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl, avatar_path: path })
    .eq("id", userId);
  if (updateError) {
    console.error("[api] educator/profile/photo profile update", updateError);
    return jsonError(500, "SUPABASE_ERROR", "Une erreur interne est survenue. Réessayez plus tard.");
  }

  if (previousPath && previousPath !== path) {
    await supabase.storage.from(PHOTO_BUCKET).remove([previousPath]);
  }

  return jsonOk({ avatarUrl }, 201);
}
