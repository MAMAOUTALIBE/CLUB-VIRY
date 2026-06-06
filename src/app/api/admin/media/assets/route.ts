import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminMediaAssetPayload } from "@/lib/api/validation";
import { createMediaAsset } from "@/lib/db/content";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "content:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminMediaAssetPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Media invalide.", payload.issues);
  }

  try {
    const asset = await createMediaAsset(payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "media.asset.created",
      entityType: "media_assets",
      entityId: asset.id,
      metadata: { title: asset.title, type: asset.type, albumId: asset.album_id }
    });

    return jsonOk({ asset }, 201);
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur creation media inconnue.");
  }
}
