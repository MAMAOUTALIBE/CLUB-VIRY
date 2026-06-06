import { jsonError, jsonOk } from "@/lib/api/http";
import { getTeamBySlug } from "@/lib/db/teams";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  const { slug } = await context.params;

  try {
    const team = await getTeamBySlug(slug);

    if (!team) {
      return jsonError(404, "NOT_FOUND", "Equipe introuvable.");
    }

    return jsonOk(team);
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur equipe inconnue.");
  }
}
