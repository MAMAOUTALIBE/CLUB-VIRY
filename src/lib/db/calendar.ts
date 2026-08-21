import "server-only";

import type { AdminEventPayload } from "@/lib/api/validation";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { ClubEvent, Match } from "@/lib/db/types";
import { dedupeRowsById } from "@/lib/publication-activity";

export type CalendarRange = {
  limit?: number;
  from?: string;
  to?: string;
};

export type PublicCalendarPayload = {
  events: ClubEvent[];
  matches: Match[];
};

type DateRangeQuery = {
  gte: (column: string, value: string) => DateRangeQuery;
  lte: (column: string, value: string) => DateRangeQuery;
};

function eventPayloadToRow(input: AdminEventPayload, actorId?: string) {
  return {
    ...(input.teamId !== undefined ? { team_id: input.teamId ?? null } : {}),
    ...(input.title ? { title: input.title } : {}),
    ...(input.type ? { type: input.type } : {}),
    ...(input.startsAt ? { starts_at: input.startsAt } : {}),
    ...(input.endsAt !== undefined ? { ends_at: input.endsAt ?? null } : {}),
    ...(input.venue !== undefined ? { venue: input.venue ?? null } : {}),
    ...(input.description !== undefined ? { description: input.description ?? null } : {}),
    ...(input.visibility ? { visibility: input.visibility } : {}),
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
  const matchesQuery = applyDateRange(supabase.from("matches").select("*").is("deleted_at", null).order("starts_at", { ascending: true }).limit(limit), range);

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
  async function matchPages() { const rows: Match[] = []; for (let offset = 0; ; offset += pageSize) { const { data, error } = await getSupabaseAdminClient().from("matches").select("*").is("deleted_at", null).gte("starts_at", from).lte("starts_at", to).order("starts_at", { ascending: true }).order("id", { ascending: true }).range(offset, offset + pageSize - 1); if (error) throw new Error(`Unable to fetch exact calendar matches: ${error.message}`); rows.push(...((data ?? []) as Match[])); if ((data ?? []).length < pageSize) return dedupeRowsById(rows); } }
  const [events, matches] = await Promise.all([eventsPages(), matchPages()]); return { events, matches };
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
