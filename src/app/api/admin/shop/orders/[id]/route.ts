import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminOrderStatusPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { getOrderBundleForAdmin, updateOrderStatus } from "@/lib/db/recruitment-shop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "shop:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  try {
    const order = await getOrderBundleForAdmin(id);

    if (!order) {
      return jsonError(404, "NOT_FOUND", "Commande introuvable.");
    }

    return jsonOk(order);
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur detail commande admin inconnue.");
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "shop:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminOrderStatusPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Commande invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const order = await updateOrderStatus(id, payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "shop.order.status_updated",
      entityType: "orders",
      entityId: order.id,
      metadata: { status: order.status, totalCents: order.total_cents }
    });

    return jsonOk({ order });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur mise a jour commande inconnue.");
  }
}
