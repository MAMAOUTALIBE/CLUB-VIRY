import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

import { canPublishContent, getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminMediaAlbumPayload } from "@/lib/api/validation";
import { updateMediaAlbum } from "@/lib/db/content";
import { recordActivity } from "@/lib/db/foundations";
import { softDeleteRow } from "@/lib/db/soft-delete";

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

  const payload = validateAdminMediaAlbumPayload(body, { partial: true });

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Album media invalide.", payload.issues);
  }

  if (payload.data.status === "PUBLISHED" && !canPublishContent(admin.context)) {
    return jsonError(403, "FORBIDDEN", "Publication non autorisée : enregistrez l'album en brouillon.");
  }

  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");

  try {
    const album = await updateMediaAlbum(id, payload.data);
    if (!album) return jsonError(404, "NOT_FOUND", "Album introuvable.");
    await recordActivity({
      actorId: admin.context.user.id,
      action: "media.album.updated",
      entityType: "media_albums",
      entityId: album.id,
      metadata: { title: album.title, slug: album.slug, status: album.status }
    });

    return jsonOk({ album });
  } catch (error) {
    return handleDbError("admin/media/albums/[id]", error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "content:manage");
  if (!admin.ok) return admin.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  try {
    const trashed = await softDeleteRow("albums", id, admin.context.user.id);
    if (!trashed) return jsonError(404, "NOT_FOUND", "Album introuvable.");
    await recordActivity({ actorId: admin.context.user.id, action: "media.album.trashed", entityType: "media_albums", entityId: id });
    revalidatePath("/medias");
    return jsonOk({ trashed: true });
  } catch (error) {
    return handleDbError("admin/media/albums/[id]", error);
  }
}
