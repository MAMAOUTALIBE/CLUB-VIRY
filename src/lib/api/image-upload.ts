import "server-only";

import type { ApiErrorCode } from "@/lib/api/http";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";

export type UploadImageType = "image/jpeg" | "image/png" | "image/webp";

/**
 * Détecte le type d'image par signature d'octets (magic bytes), indépendamment
 * de l'extension ou du Content-Type déclaré par le client. JPEG / PNG / WebP.
 */
export function sniffImageType(bytes: Uint8Array): UploadImageType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export function extensionFor(type: UploadImageType): "jpg" | "png" | "webp" {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\.[^.]+$/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export type ImageUploadResult =
  | { ok: true; url: string; path: string; contentType: UploadImageType; size: number }
  | { ok: false; status: number; code: ApiErrorCode; message: string };

/**
 * Valide (taille + signature d'octets) puis téléverse une image dans un bucket
 * Supabase Storage public et renvoie son URL publique. Toute l'écriture passe par
 * le client service-role (jamais le navigateur). Utilisé par les uploads du CRM.
 */
export async function uploadImageToBucket(opts: {
  file: File;
  bucket: string;
  folder: string;
  maxBytes: number;
}): Promise<ImageUploadResult> {
  const { file, bucket, folder, maxBytes } = opts;

  if (file.size > maxBytes) {
    return {
      ok: false,
      status: 400,
      code: "VALIDATION_ERROR",
      message: `Image trop lourde (${Math.round(maxBytes / 1024 / 1024)} Mo maximum).`
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = sniffImageType(bytes);

  if (!detected) {
    return {
      ok: false,
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Fichier image invalide : JPEG, PNG ou WebP attendu."
    };
  }

  const ext = extensionFor(detected);
  const baseName = sanitizeFileName(file.name || "image") || "image";
  const safeFolder = sanitizeFileName(folder) || "divers";
  const path = `${safeFolder}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${baseName}.${ext}`;
  const supabase = getSupabaseAdminClient();

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, bytes, {
    cacheControl: "31536000",
    contentType: detected,
    upsert: false
  });

  if (uploadError) {
    console.error(`[api] image upload to ${bucket}`, uploadError);
    return {
      ok: false,
      status: 500,
      code: "SUPABASE_ERROR",
      message: "Upload impossible. Vérifiez le stockage Supabase."
    };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return { ok: true, url: data.publicUrl, path, contentType: detected, size: file.size };
}
