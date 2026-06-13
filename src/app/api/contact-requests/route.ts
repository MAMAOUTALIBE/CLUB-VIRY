import type { NextRequest } from "next/server";

import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { validateContactMessagePayload } from "@/lib/api/validation";
import { createContactMessage } from "@/lib/db/contact-admin";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";
import { captureLead } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "contact:request", { max: 5, windowMs: 60_000 });

  if (!rateLimit.allowed) {
    return jsonError(429, "RATE_LIMITED", "Trop de tentatives. Reessayez dans quelques instants.");
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateContactMessagePayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Message de contact invalide.", payload.issues);
  }

  const meta = {
    userAgent: request.headers.get("user-agent"),
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip")
  };

  // Mode "vitrine" : sans Supabase, on capture la demande (fichier + webhook) au lieu d'echouer.
  if (!isSupabaseAdminConfigured) {
    const result = await captureLead("contact", payload.data, meta);

    if (!result.captured) {
      return jsonError(500, "CONFIGURATION_ERROR", "Impossible d'enregistrer la demande. Contactez le club par telephone.");
    }

    return jsonOk({ reference: result.reference }, 201);
  }

  try {
    const message = await createContactMessage({
      fullName: payload.data.fullName,
      email: payload.data.email,
      phone: payload.data.phone ?? null,
      subject: payload.data.subject,
      message: payload.data.message,
      metadata: meta
    });

    return jsonOk({ message }, 201);
  } catch (error) {
    return handleDbError("contact-requests", error);
  }
}
