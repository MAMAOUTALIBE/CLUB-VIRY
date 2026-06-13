import type { NextRequest } from "next/server";

import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { validatePartnershipRequestPayload } from "@/lib/api/validation";
import { createPartnershipRequest } from "@/lib/db/content";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "partners:request", { max: 5, windowMs: 60_000 });

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

  const payload = validatePartnershipRequestPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Demande partenaire invalide.", payload.issues);
  }

  try {
    const requestRow = await createPartnershipRequest(payload.data);
    return jsonOk({ request: requestRow }, 201);
  } catch (error) {
    return handleDbError("partners/requests", error);
  }
}
