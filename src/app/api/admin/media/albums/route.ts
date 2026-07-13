import type { NextRequest } from "next/server";

import { canPublishContent, getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminMediaAlbumPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { createMediaAlbum } from "@/lib/db/content";

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

  const payload = validateAdminMediaAlbumPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Album media invalide.", payload.issues);
  }

  if (payload.data.status === "PUBLISHED" && !canPublishContent(admin.context)) {
    return jsonError(403, "FORBIDDEN", "Publication non autorisée : enregistrez l'album en brouillon.");
  }

  try {
    const album = await createMediaAlbum(payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "media.album.created",
      entityType: "media_albums",
      entityId: album.id,
      metadata: { title: album.title, slug: album.slug, status: album.status }
    });

    return jsonOk({ album }, 201);
  } catch (error) {
    return handleDbError("admin/media/albums", error);
  }
}
