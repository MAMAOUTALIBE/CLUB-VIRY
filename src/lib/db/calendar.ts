import "server-only";

import type { AdminEventPayload } from "@/lib/api/validation";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { ClubEvent, Match } from "@/lib/db/types";
import { dedupeRowsById } from "@/lib/publication-activity";
import type { PublicPlanningItem } from "@/lib/public-weekly-planning";

export type CalendarRange = {
  limit?: number;
  from?: string;
  to?: string;
};

export type PublicCalendarPayload = {
  events: ClubEvent[];
  matches: Match[];
};

export type PublicHomeMatchRow = Match & {
  teams: { name: string } | null;
};

/** Exact CRM source for the mobile live/results block. No public fallback. */
export async function listPublicHomeMatches(): Promise<PublicHomeMatchRow[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("matches")
    .select("*, teams(name)")
    .eq("visibility", "PUBLIC")
    .is("deleted_at", null)
    .in("status", ["LIVE", "FINISHED"])
    .order("starts_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(`Unable to fetch home live matches: ${error.message}`);
  return (data ?? []) as PublicHomeMatchRow[];
}

/** A match is public when it is present and not soft-deleted: the current
 * matches schema has no draft/publication column. */
export async function getPublicMatchById(id: string): Promise<PublicHomeMatchRow | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("matches")
    .select("*, teams(name)")
    .eq("id", id)
    .eq("visibility", "PUBLIC")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new Error(`Unable to fetch public match: ${error.message}`);
  return (data as PublicHomeMatchRow | null) ?? null;
}

type DateRangeQuery = {
  gte: (column: string, value: string) => DateRangeQuery;
  lte: (column: string, value: string) => DateRangeQuery;
};

function eventPayloadToRow(input: AdminEventPayload, actorId?: string) {
  return {
    ...(input.teamId !== undefined ? { team_id: input.teamId ?? null } : {}),
    ...(input.categoryId !== undefined ? { category_id: input.categoryId ?? null } : {}),
    ...(input.groupLabel !== undefined ? { group_label: input.groupLabel ?? null } : {}),
    ...(input.pitchCode !== undefined ? { pitch_code: input.pitchCode ?? null } : {}),
    ...(input.opponentName !== undefined ? { opponent_name: input.opponentName ?? null } : {}),
    ...(input.educatorId !== undefined ? { educator_id: input.educatorId ?? null } : {}),
    ...(input.title ? { title: input.title } : {}),
    ...(input.type ? { type: input.type } : {}),
    ...(input.startsAt ? { starts_at: input.startsAt } : {}),
    ...(input.endsAt !== undefined ? { ends_at: input.endsAt ?? null } : {}),
    ...(input.venue !== undefined ? { venue: input.venue ?? null } : {}),
    ...(input.description !== undefined ? { description: input.description ?? null } : {}),
    ...(input.visibility ? { visibility: input.visibility } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.isFeatured !== undefined ? { is_featured: input.isFeatured } : {}),
    ...(actorId ? { created_by: actorId } : {})
  };
}

function applyDateRange<T>(query: T, range: CalendarRange, startsColumn = "starts_at"): T {
  let scopedQuery = query as DateRangeQuery;

  if (range.from) {
    scopedQuery = scopedQuery.gte(startsColumn, range.from);
  }

  if (range.to) {
    scopedQuery = scopedQuery.lte(startsColumn, range.to);
  }

  return scopedQuery as T;
}

export async function listPublicCalendar(range: CalendarRange = {}): Promise<PublicCalendarPayload> {
  const supabase = getSupabaseAdminClient();
  const limit = range.limit ?? 50;
  const eventsQuery = applyDateRange(
    supabase.from("club_events").select("*").eq("visibility", "PUBLIC").is("deleted_at", null).order("starts_at", { ascending: true }).limit(limit),
    range
  );
  const matchesQuery = applyDateRange(supabase.from("matches").select("*").eq("visibility", "PUBLIC").is("deleted_at", null).order("starts_at", { ascending: true }).limit(limit), range);

  const [{ data: events, error: eventsError }, { data: matches, error: matchesError }] = await Promise.all([eventsQuery, matchesQuery]);

  if (eventsError) {
    throw new Error(`Unable to fetch calendar events: ${eventsError.message}`);
  }

  if (matchesError) {
    throw new Error(`Unable to fetch calendar matches: ${matchesError.message}`);
  }

  return {
    events: (events ?? []) as ClubEvent[],
    matches: (matches ?? []) as Match[]
  };
}

export async function listPublicCalendarRangeExact(from: string, to: string): Promise<PublicCalendarPayload> {
  const pageSize = 1000;
  async function eventsPages() { const rows: ClubEvent[] = []; for (let offset = 0; ; offset += pageSize) { const { data, error } = await getSupabaseAdminClient().from("club_events").select("*").eq("visibility", "PUBLIC").is("deleted_at", null).gte("starts_at", from).lte("starts_at", to).order("starts_at", { ascending: true }).order("id", { ascending: true }).range(offset, offset + pageSize - 1); if (error) throw new Error(`Unable to fetch exact calendar events: ${error.message}`); rows.push(...((data ?? []) as ClubEvent[])); if ((data ?? []).length < pageSize) return dedupeRowsById(rows); } }
  async function matchPages() { const rows: Match[] = []; for (let offset = 0; ; offset += pageSize) { const { data, error } = await getSupabaseAdminClient().from("matches").select("*").eq("visibility", "PUBLIC").is("deleted_at", null).gte("starts_at", from).lte("starts_at", to).order("starts_at", { ascending: true }).order("id", { ascending: true }).range(offset, offset + pageSize - 1); if (error) throw new Error(`Unable to fetch exact calendar matches: ${error.message}`); rows.push(...((data ?? []) as Match[])); if ((data ?? []).length < pageSize) return dedupeRowsById(rows); } }
  const [events, matches] = await Promise.all([eventsPages(), matchPages()]); return { events, matches };
}

type PublicPlanningRow = {
  id: string;
  starts_at: string;
  ends_at: string | null;
  category_id: string | null;
  group_label: string | null;
  pitch_code: PublicPlanningItem["pitchCode"];
  teams: { name: string; categories: { name: string } | null } | null;
  categories: { name: string } | null;
};

function toPublicPlanningItem(row: PublicPlanningRow, source: PublicPlanningItem["source"]): PublicPlanningItem {
  return {
    id: row.id,
    source,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    categoryId: row.category_id,
    categoryName: row.categories?.name ?? row.teams?.categories?.name ?? null,
    teamName: row.teams?.name ?? null,
    groupLabel: row.group_label,
    pitchCode: row.pitch_code
  };
}

/** Public planning cards and CRM cards are projections of these exact rows. */
export async function listPublicWeeklyPlanning(from: string, toExclusive: string): Promise<PublicPlanningItem[]> {
  const fields = "id,starts_at,ends_at,category_id,group_label,pitch_code,teams(name,categories(name)),categories(name)";
  const supabase = getSupabaseAdminClient();
  const [eventsResult, matchesResult] = await Promise.all([
    supabase.from("club_events").select(fields).eq("visibility", "PUBLIC").eq("status", "SCHEDULED").is("deleted_at", null).gte("starts_at", from).lt("starts_at", toExclusive).order("starts_at", { ascending: true }),
    supabase.from("matches").select(fields).eq("visibility", "PUBLIC").neq("status", "CANCELLED").is("deleted_at", null).gte("starts_at", from).lt("starts_at", toExclusive).order("starts_at", { ascending: true })
  ]);
  if (eventsResult.error) throw new Error(`Unable to fetch public planning events: ${eventsResult.error.message}`);
  if (matchesResult.error) throw new Error(`Unable to fetch public planning matches: ${matchesResult.error.message}`);
  return [
    ...((eventsResult.data ?? []) as unknown as PublicPlanningRow[]).map((row) => toPublicPlanningItem(row, "event")),
    ...((matchesResult.data ?? []) as unknown as PublicPlanningRow[]).map((row) => toPublicPlanningItem(row, "match"))
  ].sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt));
}

export async function listEventsForAdmin(range: CalendarRange = {}): Promise<ClubEvent[]> {
  const limit = range.limit ?? 100;
  const query = applyDateRange(
    getSupabaseAdminClient().from("club_events").select("*").is("deleted_at", null).order("starts_at", { ascending: true }).limit(limit),
    range
  );
  const { data, error } = await query;

  if (error) {
    throw new Error(`Unable to fetch admin calendar events: ${error.message}`);
  }

  return (data ?? []) as ClubEvent[];
}

export async function createEvent(input: AdminEventPayload, actorId: string): Promise<ClubEvent> {
  const { data, error } = await getSupabaseAdminClient()
    .from("club_events")
    .insert({
      ...eventPayloadToRow(input, actorId),
      type: input.type ?? "CLUB_EVENT",
      visibility: input.visibility ?? "PUBLIC",
      status: input.status ?? "SCHEDULED",
      is_featured: input.isFeatured ?? false
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create calendar event: ${error.message}`);
  }

  return data as ClubEvent;
}

export async function updateEvent(id: string, input: AdminEventPayload): Promise<ClubEvent | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("club_events")
    .update(eventPayloadToRow(input))
    .eq("id", id)
    .is("deleted_at", null)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to update calendar event: ${error.message}`);
  }

  return (data as ClubEvent | null) ?? null;
}
