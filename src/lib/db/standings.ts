import "server-only";

import type { AdminStandingPayload } from "@/lib/api/validation";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { Standing } from "@/lib/db/types";

/** Lecture publique : lignes actives, groupées par compétition puis rang. */
export async function listPublicStandings(): Promise<Standing[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("standings")
    .select("*")
    .eq("is_active", true)
    .order("competition", { ascending: true })
    .order("rank", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(`Unable to fetch standings: ${error.message}`);
  }

  return (data ?? []) as Standing[];
}

export async function listStandingsForAdmin(limit = 300): Promise<Standing[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("standings")
    .select("*")
    .order("competition", { ascending: true })
    .order("rank", { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch admin standings: ${error.message}`);
  }

  return (data ?? []) as Standing[];
}

function standingPayloadToRow(input: AdminStandingPayload): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.competition) row.competition = input.competition;
  if (input.teamName) row.team_name = input.teamName;
  if (input.rank !== undefined) row.rank = input.rank;
  if (input.played !== undefined) row.played = input.played;
  if (input.won !== undefined) row.won = input.won;
  if (input.drawn !== undefined) row.drawn = input.drawn;
  if (input.lost !== undefined) row.lost = input.lost;
  if (input.goalsFor !== undefined) row.goals_for = input.goalsFor;
  if (input.goalsAgainst !== undefined) row.goals_against = input.goalsAgainst;
  if (input.points !== undefined) row.points = input.points;
  if (input.isOwnClub !== undefined) row.is_own_club = input.isOwnClub;
  if (input.isActive !== undefined) row.is_active = input.isActive;
  return row;
}

export async function createStanding(input: AdminStandingPayload): Promise<Standing> {
  const { data, error } = await getSupabaseAdminClient()
    .from("standings")
    .insert({ ...standingPayloadToRow(input), is_active: input.isActive ?? true })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create standing: ${error.message}`);
  }

  return data as Standing;
}

export async function updateStanding(id: string, input: AdminStandingPayload): Promise<Standing | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("standings")
    .update(standingPayloadToRow(input))
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to update standing: ${error.message}`);
  }

  return (data as Standing | null) ?? null;
}

/** Suppression définitive (les classements sont éphémères, pas de corbeille). */
export async function deleteStanding(id: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdminClient()
    .from("standings")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    throw new Error(`Unable to delete standing: ${error.message}`);
  }

  return (data ?? []).length > 0;
}
