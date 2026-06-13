import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminProductPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { updateProduct } from "@/lib/db/recruitment-shop";

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

  const payload = validateAdminProductPayload(body, { partial: true });

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Produit invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const product = await updateProduct(id, payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "shop.product.updated",
      entityType: "products",
      entityId: product.id,
      metadata: { name: product.name, slug: product.slug, status: product.status }
    });

    return jsonOk({ product });
  } catch (error) {
    return handleDbError("admin/shop/products/[id]", error);
  }
}
