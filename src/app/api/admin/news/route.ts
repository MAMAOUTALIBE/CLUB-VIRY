import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminNewsPayload } from "@/lib/api/validation";
import { createNewsArticle, listNewsForAdmin } from "@/lib/db/content";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "content:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 50) || 50, 100);

  try {
    const news = await listNewsForAdmin(limit);
    return jsonOk({ news });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur actualites admin inconnue.");
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "content:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminNewsPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Actualite invalide.", payload.issues);
  }

  try {
    const article = await createNewsArticle(payload.data, admin.context.user.id);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "news.created",
      entityType: "news",
      entityId: article.id,
      metadata: { title: article.title, status: article.status }
    });

    return jsonOk({ article }, 201);
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur creation actualite inconnue.");
  }
}
