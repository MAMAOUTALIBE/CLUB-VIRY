import type { NextRequest } from "next/server";

import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { getAuthContext } from "@/lib/auth/session";
import { getOrderBundleForProfile } from "@/lib/db/recruitment-shop";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await getAuthContext(request);

  if (!auth.ok) {
    return jsonError(auth.status, auth.code, auth.message);
  }

  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  const { id } = await context.params;

  if (!uuidPattern.test(id)) {
    return jsonError(400, "VALIDATION_ERROR", "Identifiant commande invalide.");
  }

  try {
    const order = await getOrderBundleForProfile(auth.context.user.id, id);

    if (!order) {
      return jsonError(404, "NOT_FOUND", "Commande introuvable ou inaccessible.");
    }

    return jsonOk(order);
  } catch (error) {
    return handleDbError("orders/[id]", error);
  }
}
