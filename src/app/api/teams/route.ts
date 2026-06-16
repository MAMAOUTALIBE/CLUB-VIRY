import { jsonOk } from "@/lib/api/http";
import { listTeams } from "@/lib/db/teams";
import { getFallbackTeams } from "@/lib/public-fallbacks";
import { readPublicDb } from "@/lib/public-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const teams = await readPublicDb(() => listTeams());
  if (teams && teams.length > 0) {
    return jsonOk({ teams });
  }

  return jsonOk({ teams: getFallbackTeams() });
}
