import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminMediaAlbumPayload } from "@/lib/api/validation";
import { updateMediaAlbum } from "@/lib/db/content";
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

  const payload = validateAdminMediaAlbumPayload(body, { partial: true });

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Album media invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const album = await updateMediaAlbum(id, payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "media.album.updated",
      entityType: "media_albums",
      entityId: album.id,
      metadata: { title: album.title, slug: album.slug, status: album.status }
    });

    return jsonOk({ album });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur mise a jour album media inconnue.");
  }
}
