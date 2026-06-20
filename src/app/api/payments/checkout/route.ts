import type { NextRequest } from "next/server";

import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { validateCheckoutPayload } from "@/lib/api/validation";
import { getAuthContext } from "@/lib/auth";
import { createCheckout, getOrderBundleForProfile } from "@/lib/db/recruitment-shop";
import { getRegistrationForProfile } from "@/lib/db/registrations";
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

  // Un paiement est toujours rattaché à un compte : l'authentification est obligatoire.
  const auth = await getAuthContext(request);

  if (!auth.ok) {
    return jsonError(auth.status, auth.code, auth.message);
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateCheckoutPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Paiement invalide.", payload.issues);
  }

  if ((payload.data.provider ?? "manual") === "stripe") {
    return jsonError(409, "PAYMENT_UNAVAILABLE", "Le paiement par carte n'est pas encore connecte.");
  }

  const profileId = auth.context.user.id;

  try {
    // SÉCURITÉ : le montant est TOUJOURS recalculé côté serveur à partir d'une
    // ressource dont l'appelant est propriétaire. Tout `amountCents` envoyé par le
    // client est ignoré (sinon : paiement à 1 centime d'une commande à 200 €).
    let amountCents: number;

    if (payload.data.orderId) {
      const bundle = await getOrderBundleForProfile(profileId, payload.data.orderId);

      if (!bundle) {
        return jsonError(404, "NOT_FOUND", "Commande introuvable ou non autorisee.");
      }

      amountCents = bundle.order.total_cents;
    } else if (payload.data.registrationId) {
      const registration = await getRegistrationForProfile(profileId, payload.data.registrationId);

      if (!registration) {
        return jsonError(404, "NOT_FOUND", "Inscription introuvable ou non autorisee.");
      }

      // Aucun barème d'inscription n'est encore modélisé côté serveur : on refuse
      // explicitement plutôt que de faire confiance à un montant fourni par le client.
      return jsonError(409, "PAYMENT_UNAVAILABLE", "Le paiement d'inscription en ligne n'est pas encore disponible.");
    } else {
      return jsonError(400, "VALIDATION_ERROR", "Une commande ou une inscription est obligatoire.");
    }

    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      return jsonError(409, "PAYMENT_UNAVAILABLE", "Aucun montant a regler pour cette ressource.");
    }

    const payment = await createCheckout({
      orderId: payload.data.orderId ?? null,
      registrationId: payload.data.registrationId ?? null,
      amountCents,
      provider: payload.data.provider ?? "manual",
      profileId
    });

    return jsonOk(
      {
        payment,
        providerStatus: payment.provider === "stripe" ? "STRIPE_NOT_CONNECTED_YET" : "MANUAL_PAYMENT_PENDING"
      },
      201
    );
  } catch (error) {
    return handleDbError("payments/checkout", error);
  }
}
