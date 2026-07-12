import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminNewsPayload } from "@/lib/api/validation";
import { updateNewsArticle } from "@/lib/db/content";
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

  const payload = validateAdminNewsPayload(body, { partial: true });

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Actualite invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const article = await updateNewsArticle(id, payload.data);

    if (!article) {
      return jsonError(404, "NOT_FOUND", "Actualité introuvable.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "news.updated",
      entityType: "news",
      entityId: article.id,
      metadata: { title: article.title, status: article.status }
    });

    return jsonOk({ article });
  } catch (error) {
    return handleDbError("admin/news/[id]", error);
  }
}

/** Suppression réversible : déplace l'actualité vers la corbeille (restaurable). */
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
    const trashed = await softDeleteRow("news", id);

    if (!trashed) {
      return jsonError(404, "NOT_FOUND", "Actualité introuvable.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "news.trashed",
      entityType: "news",
      entityId: id
    });
    revalidatePath("/");
    revalidatePath("/actualites");

    return jsonOk({ trashed: true });
  } catch (error) {
    return handleDbError("admin/news/[id]", error);
  }
}
