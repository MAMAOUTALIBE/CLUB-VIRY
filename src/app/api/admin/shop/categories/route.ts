import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminProductCategoryPayload } from "@/lib/api/validation";
import { createProductCategory } from "@/lib/db/recruitment-shop";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "shop:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminProductCategoryPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Categorie produit invalide.", payload.issues);
  }

  try {
    const category = await createProductCategory(payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "shop.category.created",
      entityType: "product_categories",
      entityId: category.id,
      metadata: { name: category.name, slug: category.slug }
    });

    return jsonOk({ category }, 201);
  } catch (error) {
    return handleDbError("admin/shop/categories", error);
  }
}
