import { handleDbError, jsonOk } from "@/lib/api/http";
import { listTeams } from "@/lib/db/teams";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";
import { getPublicTeams } from "@/lib/public-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!isSupabaseAdminConfigured) {
      const teams = await getPublicTeams();
      return jsonOk({ teams });
    }

    const teams = await listTeams();
    return jsonOk({ teams });
  } catch (error) {
    return handleDbError("teams", error);
  }
}
