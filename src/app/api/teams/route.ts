import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { listTeams } from "@/lib/db/teams";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  try {
    const teams = await listTeams();
    return jsonOk({ teams });
  } catch (error) {
    return handleDbError("teams", error);
  }
}
