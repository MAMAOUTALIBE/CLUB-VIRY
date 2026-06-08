import type { NextRequest } from "next/server";

import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { validateRegistrationLeadPayload } from "@/lib/api/validation";
import { captureLead } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Demande d'inscription publique (capture de lead).
 *
 * Volontairement independant du flux d'inscription authentifie (`/api/registrations`)
 * qui necessite un compte famille + Supabase. Ici une famille remplit le formulaire
 * d'inscription du site vitrine, le club est notifie et recontacte pour finaliser.
 */
export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "registration:lead", { max: 8, windowMs: 60_000 });

  if (!rateLimit.allowed) {
    return jsonError(429, "RATE_LIMITED", "Trop de tentatives. Reessayez dans quelques instants.");
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateRegistrationLeadPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Demande d'inscription invalide.", payload.issues);
  }

  const meta = {
    userAgent: request.headers.get("user-agent"),
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip")
  };

  const result = await captureLead("registration", payload.data, meta);

  if (!result.captured) {
    return jsonError(500, "CONFIGURATION_ERROR", "Impossible d'enregistrer la demande. Contactez le club par telephone.");
  }

  return jsonOk({ reference: result.reference }, 201);
}
