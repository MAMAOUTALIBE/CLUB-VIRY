import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminProductPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { createProduct } from "@/lib/db/recruitment-shop";

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

  const payload = validateAdminProductPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Produit invalide.", payload.issues);
  }

  try {
    const product = await createProduct(payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "shop.product.created",
      entityType: "products",
      entityId: product.id,
      metadata: { name: product.name, slug: product.slug, status: product.status }
    });

    return jsonOk({ product }, 201);
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur creation produit inconnue.");
  }
}
