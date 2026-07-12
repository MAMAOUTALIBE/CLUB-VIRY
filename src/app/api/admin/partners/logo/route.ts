import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { uploadImageToBucket } from "@/lib/api/image-upload";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PARTNER_LOGOS_BUCKET = "partner-logos";
const MAX_BYTES = 2 * 1024 * 1024;

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

  const result = await uploadImageToBucket({ file, bucket: PARTNER_LOGOS_BUCKET, folder: "logos", maxBytes: MAX_BYTES });

  if (!result.ok) {
    return jsonError(result.status, result.code, result.message);
  }

  await recordActivity({
    actorId: admin.context.user.id,
    action: "partner.logo_uploaded",
    entityType: "partners",
    metadata: {
      bucket: PARTNER_LOGOS_BUCKET,
      path: result.path,
      contentType: result.contentType,
      size: result.size
    }
  });

  return jsonOk({ logoUrl: result.url, path: result.path }, 201);
}
