import type { NextRequest } from "next/server";

import { getFallbackCalendarItems } from "@/lib/calendar-view";
import { handleDbError, jsonOk, parseLimit } from "@/lib/api/http";
import { listPublicCalendar } from "@/lib/db/calendar";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";
import type { Match, MatchLocation } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getDateParam(value: string | null): string | undefined {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    return undefined;
  }

  return value;
}

const fallbackStartsAt = ["2026-09-05T18:00:00+02:00", "2026-09-06T15:00:00+02:00", "2026-09-05T15:00:00+02:00"];
const clubName = "ES Viry-Châtillon";

function getFallbackMatches(limit: number): Match[] {
  const now = new Date().toISOString();

  return getFallbackCalendarItems()
    .slice(0, limit)
    .map((item, index) => {
      const location: MatchLocation = item.home === clubName ? "HOME" : item.away === clubName ? "AWAY" : "NEUTRAL";
      const opponentName = location === "AWAY" ? (item.home ?? "Adversaire à confirmer") : (item.away ?? "Adversaire à confirmer");

      return {
        id: item.id,
        team_id: null,
        season_id: null,
        opponent_name: opponentName,
        opponent_logo_url: null,
        location,
        starts_at: fallbackStartsAt[index] ?? now,
        venue: item.place,
        competition: item.title,
        status: "SCHEDULED",
        home_score: null,
        away_score: null,
        notes: null,
        created_at: now,
        updated_at: now
      };
    });
}

export async function GET(request: NextRequest) {
  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 50, 100);
  const from = getDateParam(request.nextUrl.searchParams.get("from"));
  const to = getDateParam(request.nextUrl.searchParams.get("to"));

  try {
    if (!isSupabaseAdminConfigured) {
      return jsonOk({ events: [], matches: getFallbackMatches(limit) });
    }

    const calendar = await listPublicCalendar({ limit, from, to });
    return jsonOk(calendar);
  } catch (error) {
    return handleDbError("calendar", error);
  }
}
