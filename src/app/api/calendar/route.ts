import type { NextRequest } from "next/server";

import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { listPublicCalendar } from "@/lib/db/calendar";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getDateParam(value: string | null): string | undefined {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    return undefined;
  }

  return value;
}

export async function GET(request: NextRequest) {
  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 50) || 50, 100);
  const from = getDateParam(request.nextUrl.searchParams.get("from"));
  const to = getDateParam(request.nextUrl.searchParams.get("to"));

  try {
    const calendar = await listPublicCalendar({ limit, from, to });
    return jsonOk(calendar);
  } catch (error) {
    return handleDbError("calendar", error);
  }
}
