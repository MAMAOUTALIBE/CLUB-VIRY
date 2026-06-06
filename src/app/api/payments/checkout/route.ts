import type { NextRequest } from "next/server";

import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { validateCheckoutPayload } from "@/lib/api/validation";
import { createCheckout } from "@/lib/db/recruitment-shop";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "payments:checkout", { max: 12, windowMs: 60_000 });

  if (!rateLimit.allowed) {
    return jsonError(429, "RATE_LIMITED", "Trop de tentatives. Reessayez dans quelques instants.");
  }

  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateCheckoutPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Paiement invalide.", payload.issues);
  }

  try {
    const payment = await createCheckout({
      orderId: payload.data.orderId ?? null,
      registrationId: payload.data.registrationId ?? null,
      amountCents: payload.data.amountCents ?? null,
      provider: payload.data.provider ?? "manual"
    });

    return jsonOk(
      {
        payment,
        providerStatus: payment.provider === "stripe" ? "STRIPE_NOT_CONNECTED_YET" : "MANUAL_PAYMENT_PENDING"
      },
      201
    );
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur paiement inconnue.");
  }
}
