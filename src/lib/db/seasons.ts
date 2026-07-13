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

/**
 * Une seule saison active à la fois (contrainte DB `seasons_single_active_idx`).
 * On désactive les saisons actives AVANT d'en activer une autre, sinon l'index
 * unique partiel rejette l'opération. `exceptId` préserve la saison ciblée.
 */
async function deactivateActiveSeasons(exceptId?: string): Promise<void> {
  const base = getSupabaseAdminClient().from("seasons").update({ is_active: false }).eq("is_active", true);
  const { error } = await (exceptId ? base.neq("id", exceptId) : base);

  if (error) {
    throw new Error(`Unable to deactivate active seasons: ${error.message}`);
  }
}

export async function createSeason(input: AdminSeasonPayload): Promise<Season> {
  const active = input.isActive ?? false;

  // Libère l'unicité de la saison active avant d'insérer une nouvelle saison active.
  if (active) {
    await deactivateActiveSeasons();
  }

  const { data, error } = await getSupabaseAdminClient()
    .from("seasons")
    .insert({ ...seasonPayloadToRow(input), is_active: active })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create season: ${error.message}`);
  }

  return data as Season;
}

export async function updateSeason(id: string, input: AdminSeasonPayload): Promise<Season | null> {
  // Si l'on active cette saison, désactive les autres AVANT la mise à jour.
  if (input.isActive === true) {
    await deactivateActiveSeasons(id);
  }

  const { data, error } = await getSupabaseAdminClient()
    .from("seasons")
    .update(seasonPayloadToRow(input))
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to update season: ${error.message}`);
  }

  return (data as Season | null) ?? null;
}
