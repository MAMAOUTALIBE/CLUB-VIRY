import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminPaymentUpdatePayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { getPaymentForAdmin, updatePaymentForAdmin } from "@/lib/db/recruitment-shop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "payments:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  try {
    const payment = await getPaymentForAdmin(id);

    if (!payment) {
      return jsonError(404, "NOT_FOUND", "Paiement introuvable.");
    }

    return jsonOk({ payment });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur detail paiement admin inconnue.");
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "payments:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminPaymentUpdatePayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Paiement invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const payment = await updatePaymentForAdmin(id, payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "payment.updated",
      entityType: "payments",
      entityId: payment.id,
      metadata: {
        status: payment.status,
        provider: payment.provider,
        providerReference: payment.provider_reference,
        amountCents: payment.amount_cents
      }
    });

    return jsonOk({ payment });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur mise a jour paiement inconnue.");
  }
}
