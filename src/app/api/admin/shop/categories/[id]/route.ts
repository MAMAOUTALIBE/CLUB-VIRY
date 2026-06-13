import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminProductCategoryPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { updateProductCategory } from "@/lib/db/recruitment-shop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "shop:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminProductCategoryPayload(body, { partial: true });

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Categorie produit invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const category = await updateProductCategory(id, payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "shop.category.updated",
      entityType: "product_categories",
      entityId: category.id,
      metadata: { name: category.name, slug: category.slug, isActive: category.is_active }
    });

    return jsonOk({ category });
  } catch (error) {
    return handleDbError("admin/shop/categories/[id]", error);
  }
}
