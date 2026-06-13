import type { NextRequest } from "next/server";

import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { getAuthContext } from "@/lib/auth/session";
import { getRegistrationForProfile } from "@/lib/db/registrations";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await getAuthContext(request);

  if (!auth.ok) {
    return jsonError(auth.status, auth.code, auth.message);
  }

  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  const { id } = await context.params;

  try {
    const registration = await getRegistrationForProfile(auth.context.user.id, id);

    if (!registration) {
      return jsonError(404, "FORBIDDEN", "Dossier introuvable ou inaccessible.");
    }

    return jsonOk(registration);
  } catch (error) {
    return handleDbError("registrations/[id]", error);
  }
}
