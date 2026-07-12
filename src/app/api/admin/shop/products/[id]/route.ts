import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminProductPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { updateProduct } from "@/lib/db/recruitment-shop";
import { softDeleteRow } from "@/lib/db/soft-delete";

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

/** Suppression réversible : déplace le produit vers la corbeille (restaurable). */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "shop:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  if (!isUuid(id)) {
    return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  }

  try {
    const trashed = await softDeleteRow("products", id);

    if (!trashed) {
      return jsonError(404, "NOT_FOUND", "Produit introuvable.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "shop.product.trashed",
      entityType: "products",
      entityId: id
    });
    revalidatePath("/boutique");

    return jsonOk({ trashed: true });
  } catch (error) {
    return handleDbError("admin/shop/products/[id]", error);
  }
}
