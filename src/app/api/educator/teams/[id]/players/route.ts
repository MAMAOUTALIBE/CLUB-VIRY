import type { NextRequest } from "next/server";

import { getEducatorContext } from "@/lib/api/educator-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { getEducatorTeamRoster } from "@/lib/db/teams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const educator = await getEducatorContext(request);

  if (!educator.ok) {
    return educator.response;
  }

  const { id } = await context.params;

  try {
    const roster = await getEducatorTeamRoster(id, educator.context.user.id, educator.context.canManageAllTeams);

    if (!roster) {
      return jsonError(404, "NOT_FOUND", "Equipe introuvable ou non autorisee.");
    }

    return jsonOk(roster);
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur effectif educateur inconnue.");
  }
}
