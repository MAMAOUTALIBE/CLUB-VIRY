import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminMediaAssetPayload } from "@/lib/api/validation";
import { deleteMediaAsset, updateMediaAsset } from "@/lib/db/content";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "content:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminMediaAssetPayload(body, { partial: true });

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Media invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const asset = await updateMediaAsset(id, payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "media.asset.updated",
      entityType: "media_assets",
      entityId: asset.id,
      metadata: { title: asset.title, type: asset.type, albumId: asset.album_id }
    });

    return jsonOk({ asset });
  } catch (error) {
    return handleDbError("admin/media/assets/[id]", error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "content:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  if (!isUuid(id)) {
    return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  }

  try {
    const deleted = await deleteMediaAsset(id);

    if (!deleted) {
      return jsonError(404, "NOT_FOUND", "Média introuvable.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "media.asset.deleted",
      entityType: "media_assets",
      entityId: id
    });

    return jsonOk({ deleted: true });
  } catch (error) {
    return handleDbError("admin/media/assets/[id]", error);
  }
}
