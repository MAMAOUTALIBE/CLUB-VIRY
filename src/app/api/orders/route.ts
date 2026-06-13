import type { NextRequest } from "next/server";

import { getBearerToken, handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { validateOrderPayload } from "@/lib/api/validation";
import { getAuthContext } from "@/lib/auth/session";
import { createOrder, listOrdersForProfile } from "@/lib/db/recruitment-shop";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);

  if (!auth.ok) {
    return jsonError(auth.status, auth.code, auth.message);
  }

  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  try {
    const orders = await listOrdersForProfile(auth.context.user.id);
    return jsonOk({ orders });
  } catch (error) {
    return handleDbError("orders", error);
  }
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "orders:create", { max: 12, windowMs: 60_000 });

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

  const payload = validateOrderPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Commande invalide.", payload.issues);
  }

  const token = getBearerToken(request);
  const auth = token ? await getAuthContext(request) : null;
  const profileId = auth?.ok ? auth.context.user.id : null;

  try {
    const order = await createOrder({
      profileId,
      email: payload.data.email,
      customerName: payload.data.customerName,
      phone: payload.data.phone ?? null,
      notes: payload.data.notes ?? null,
      items: payload.data.items
    });

    return jsonOk(order, 201);
  } catch (error) {
    return handleDbError("orders", error);
  }
}
