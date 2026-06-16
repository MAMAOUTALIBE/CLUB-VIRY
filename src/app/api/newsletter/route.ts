import type { NextRequest } from "next/server";

import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { validateNewsletterPayload } from "@/lib/api/validation";
import { captureLead } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "newsletter:subscribe", { max: 5, windowMs: 60_000 });

  if (!rateLimit.allowed) {
    return jsonError(429, "RATE_LIMITED", "Trop de tentatives. Reessayez dans quelques instants.");
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateNewsletterPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Inscription newsletter invalide.", payload.issues);
  }

  const meta = {
    userAgent: request.headers.get("user-agent"),
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip")
  };

  // La newsletter ne necessite pas de base : capture lead (fichier JSONL + webhook) en vitrine comme en CRM.
  const result = await captureLead("newsletter", payload.data, meta);

  if (!result.captured) {
    return jsonError(500, "CONFIGURATION_ERROR", "Impossible d'enregistrer votre inscription. Reessayez plus tard.");
  }

  return jsonOk({ reference: result.reference }, 201);
}
