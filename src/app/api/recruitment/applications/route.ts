import type { NextRequest } from "next/server";

import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { validateRecruitmentApplicationPayload } from "@/lib/api/validation";
import { createRecruitmentApplication } from "@/lib/db/recruitment-shop";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";
import { captureLead } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "recruitment:application", { max: 8, windowMs: 60_000 });

  if (!rateLimit.allowed) {
    return jsonError(429, "RATE_LIMITED", "Trop de tentatives. Reessayez dans quelques instants.");
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateRecruitmentApplicationPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Candidature invalide.", payload.issues);
  }

  const meta = {
    userAgent: request.headers.get("user-agent"),
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip")
  };

  // Mode "vitrine" : sans Supabase, on capture la candidature (fichier + webhook) au lieu d'echouer.
  if (!isSupabaseAdminConfigured) {
    const result = await captureLead("recruitment", payload.data, meta);

    if (!result.captured) {
      return jsonError(500, "CONFIGURATION_ERROR", "Impossible d'enregistrer la candidature. Contactez le club par telephone.");
    }

    return jsonOk({ reference: result.reference }, 201);
  }

  try {
    const application = await createRecruitmentApplication(payload.data);
    return jsonOk({ application }, 201);
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur candidature inconnue.");
  }
}
