import type { NextRequest } from "next/server";

import { handleDbError, jsonOk, parseLimit } from "@/lib/api/http";
import { matches as fallbackMatches } from "@/lib/data";
import { listMatches } from "@/lib/db/teams";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";
import type { Match } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fallbackMatchDates = ["2026-09-05T18:00:00+02:00", "2026-09-06T15:00:00+02:00", "2026-09-05T15:00:00+02:00"];

function getFallbackMatches(limit: number): Match[] {
  return fallbackMatches.slice(0, limit).map((match, index) => ({
    id: `fallback-match-${index + 1}`,
    team_id: null,
    season_id: null,
    opponent_name: match.away,
    opponent_logo_url: null,
    location: "HOME",
    starts_at: fallbackMatchDates[index] ?? "",
    venue: match.place,
    competition: match.team,
    status: "SCHEDULED",
    home_score: null,
    away_score: null,
    notes: null,
    created_at: "",
    updated_at: ""
  }));
}

export async function GET(request: NextRequest) {
  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 20, 50);

  if (!isSupabaseAdminConfigured) {
    return jsonOk({ matches: getFallbackMatches(limit) });
  }

  try {
    const matches = await listMatches(limit);
    return jsonOk({ matches });
  } catch (error) {
    return handleDbError("matches", error);
  }
}
