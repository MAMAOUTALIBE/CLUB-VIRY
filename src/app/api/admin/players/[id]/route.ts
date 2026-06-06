import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { getPlayerDetailForAdmin } from "@/lib/db/family";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "players:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  try {
    const player = await getPlayerDetailForAdmin(id);

    if (!player) {
      return jsonError(404, "NOT_FOUND", "Joueur introuvable.");
    }

    return jsonOk(player);
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur detail joueur inconnue.");
  }
}
