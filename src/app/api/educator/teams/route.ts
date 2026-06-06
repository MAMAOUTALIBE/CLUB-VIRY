import type { NextRequest } from "next/server";

import { getEducatorContext } from "@/lib/api/educator-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { listTeamsForEducator } from "@/lib/db/teams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const educator = await getEducatorContext(request);

  if (!educator.ok) {
    return educator.response;
  }

  try {
    const teams = await listTeamsForEducator(educator.context.user.id, educator.context.canManageAllTeams);
    return jsonOk({ teams });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur equipes educateur inconnue.");
  }
}
