import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminCategoryPayload } from "@/lib/api/validation";
import { updateCategory } from "@/lib/db/categories";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "teams:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  }

  const payload = validateAdminCategoryPayload(body, { partial: true });

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Catégorie invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const category = await updateCategory(id, payload.data);

    if (!category) {
      return jsonError(404, "NOT_FOUND", "Catégorie introuvable.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "category.updated",
      entityType: "categories",
      entityId: category.id,
      metadata: { name: category.name, gender: category.gender, isActive: category.is_active }
    });

    return jsonOk({ category });
  } catch (error) {
    return handleDbError("admin/categories/[id]", error);
  }
}
