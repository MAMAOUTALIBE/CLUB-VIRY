import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminProductVariantPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { createProductVariant } from "@/lib/db/recruitment-shop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "shop:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminProductVariantPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Variante produit invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const variant = await createProductVariant(id, payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "shop.variant.created",
      entityType: "product_variants",
      entityId: variant.id,
      metadata: { productId: variant.product_id, label: variant.label, stockQuantity: variant.stock_quantity }
    });

    return jsonOk({ variant }, 201);
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur creation variante produit inconnue.");
  }
}
