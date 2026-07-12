import "server-only";

import type { AdminSeasonPayload } from "@/lib/api/validation";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { Season } from "@/lib/db/types";

export async function listSeasonsForAdmin(limit = 50): Promise<Season[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("seasons")
    .select("*")
    .order("starts_on", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch seasons: ${error.message}`);
  }

  return (data ?? []) as Season[];
}

function seasonPayloadToRow(input: AdminSeasonPayload) {
  return {
    ...(input.name ? { name: input.name } : {}),
    ...(input.startsOn ? { starts_on: input.startsOn } : {}),
    ...(input.endsOn ? { ends_on: input.endsOn } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {})
  };
}

/** Une seule saison active à la fois : désactive toutes les autres. */
async function deactivateOtherSeasons(exceptId: string): Promise<void> {
  const { error } = await getSupabaseAdminClient()
    .from("seasons")
    .update({ is_active: false })
    .eq("is_active", true)
    .neq("id", exceptId);

  if (error) {
    throw new Error(`Unable to deactivate other seasons: ${error.message}`);
  }
}

export async function createSeason(input: AdminSeasonPayload): Promise<Season> {
  const { data, error } = await getSupabaseAdminClient()
    .from("seasons")
    .insert({ ...seasonPayloadToRow(input), is_active: input.isActive ?? false })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create season: ${error.message}`);
  }

  const season = data as Season;

  if (season.is_active) {
    await deactivateOtherSeasons(season.id);
  }

  return season;
}

export async function updateSeason(id: string, input: AdminSeasonPayload): Promise<Season | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("seasons")
    .update(seasonPayloadToRow(input))
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to update season: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const season = data as Season;

  if (season.is_active) {
    await deactivateOtherSeasons(season.id);
  }

  return season;
}
