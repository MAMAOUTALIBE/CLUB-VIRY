import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { uploadImageToBucket } from "@/lib/api/image-upload";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_UPLOADS_BUCKET = "site-uploads";
const MAX_BYTES = 5 * 1024 * 1024;

// Dossiers autorisés à l'intérieur du bucket public (défense contre les valeurs
// arbitraires côté client ; toute autre valeur retombe sur « divers »).
const ALLOWED_FOLDERS = new Set(["actualites", "produits", "medias", "direction", "divers"]);

/**
 * Upload d'image générique du CRM. Réutilisé par tous les modules (couverture
 * d'actualité, image produit, média, photo de dirigeant) via le champ `file`
 * d'AdminCrud. Renvoie l'URL publique dans data.url.
 */
export async function POST(request: NextRequest) {
  // content:manage couvre les rôles qui éditent le contenu (SUPER_ADMIN, ADMIN_CLUB,
  // DIRIGEANT). L'image n'est rattachée à aucun contenu tant que la fiche n'est pas
  // enregistrée — opération à faible sensibilité (image validée, bucket public).
  const admin = await getAdminContext(request, "content:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const rateLimit = checkRateLimit(request, "admin:uploads", { max: 40, windowMs: 60_000 });

  if (!rateLimit.allowed) {
    return jsonError(429, "RATE_LIMITED", "Trop d'envois. Réessayez dans un instant.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError(400, "VALIDATION_ERROR", "Requête invalide (multipart attendu).");
  }

  const file = form.get("file");

  if (!(file instanceof File)) {
    return jsonError(400, "VALIDATION_ERROR", "Fichier image manquant.");
  }

  const requestedFolder = String(form.get("folder") ?? "divers");
  const folder = ALLOWED_FOLDERS.has(requestedFolder) ? requestedFolder : "divers";

  const result = await uploadImageToBucket({ file, bucket: SITE_UPLOADS_BUCKET, folder, maxBytes: MAX_BYTES });

  if (!result.ok) {
    return jsonError(result.status, result.code, result.message);
  }

  await recordActivity({
    actorId: admin.context.user.id,
    action: "media.uploaded",
    entityType: "site-uploads",
    metadata: {
      bucket: SITE_UPLOADS_BUCKET,
      folder,
      path: result.path,
      contentType: result.contentType,
      size: result.size
    }
  });

  return jsonOk({ url: result.url, path: result.path }, 201);
}
