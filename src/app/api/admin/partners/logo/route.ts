import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PARTNER_LOGOS_BUCKET = "partner-logos";
const MAX_BYTES = 2 * 1024 * 1024;

function sniffImageType(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
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

function extensionFor(type: "image/jpeg" | "image/png" | "image/webp"): "jpg" | "png" | "webp" {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\.[^.]+$/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "partners:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const rateLimit = checkRateLimit(request, "admin:partners:logo-upload", { max: 20, windowMs: 60_000 });

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
    return jsonError(400, "VALIDATION_ERROR", "Fichier logo manquant.");
  }

  if (file.size > MAX_BYTES) {
    return jsonError(400, "VALIDATION_ERROR", "Logo trop lourd (2 Mo maximum).");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = sniffImageType(bytes);

  if (!detected) {
    return jsonError(400, "VALIDATION_ERROR", "Fichier image invalide : JPEG, PNG ou WebP attendu.");
  }

  const ext = extensionFor(detected);
  const baseName = sanitizeFileName(file.name || "logo") || "logo";
  const path = `logos/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${baseName}.${ext}`;
  const supabase = getSupabaseAdminClient();

  const { error: uploadError } = await supabase.storage.from(PARTNER_LOGOS_BUCKET).upload(path, bytes, {
    cacheControl: "31536000",
    contentType: detected,
    upsert: false
  });

  if (uploadError) {
    console.error("[api] admin/partners/logo storage upload", uploadError);
    return jsonError(500, "SUPABASE_ERROR", "Upload impossible. Vérifiez le stockage Supabase.");
  }

  const { data } = supabase.storage.from(PARTNER_LOGOS_BUCKET).getPublicUrl(path);
  const logoUrl = data.publicUrl;

  await recordActivity({
    actorId: admin.context.user.id,
    action: "partner.logo_uploaded",
    entityType: "partners",
    metadata: {
      bucket: PARTNER_LOGOS_BUCKET,
      path,
      contentType: detected,
      size: file.size
    }
  });

  return jsonOk({ logoUrl, path }, 201);
}
