import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, parseLimit, readJsonBody } from "@/lib/api/http";
import { validateAdminCategoryPayload } from "@/lib/api/validation";
import { createCategory, listCategoriesForAdmin } from "@/lib/db/categories";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "teams:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 100, 200);

  try {
    return jsonOk({ categories: await listCategoriesForAdmin(limit) });
  } catch (error) {
    return handleDbError("admin/categories", error);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "teams:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  }

  const payload = validateAdminCategoryPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Catégorie invalide.", payload.issues);
  }

  try {
    const category = await createCategory(payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "category.created",
      entityType: "categories",
      entityId: category.id,
      metadata: { name: category.name, gender: category.gender }
    });

    return jsonOk({ category }, 201);
  } catch (error) {
    return handleDbError("admin/categories", error);
  }
}
