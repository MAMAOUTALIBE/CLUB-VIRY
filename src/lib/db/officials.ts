import "server-only";

import type { AdminOfficialPayload } from "@/lib/api/validation";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { ClubOfficial } from "@/lib/db/types";

function officialPayloadToRow(input: AdminOfficialPayload) {
  return {
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.fullName ? { full_name: input.fullName } : {}),
    ...(input.position ? { position: input.position } : {}),
    ...(input.photoUrl !== undefined ? { photo_url: input.photoUrl ?? null } : {}),
    ...(input.orderIndex !== undefined ? { order_index: input.orderIndex } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {})
  };
}

/** Lecture publique : membres actifs, triés bureau d'abord puis par ordre. */
export async function listClubOfficials(): Promise<ClubOfficial[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("club_officials")
    .select("*")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("order_index", { ascending: true })
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(`Unable to fetch club officials: ${error.message}`);
  }

  return (data ?? []) as ClubOfficial[];
}

export async function listOfficialsForAdmin(limit = 200): Promise<ClubOfficial[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("club_officials")
    .select("*")
    .order("category", { ascending: true })
    .order("order_index", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch admin officials: ${error.message}`);
  }

  return (data ?? []) as ClubOfficial[];
}

export async function createOfficial(input: AdminOfficialPayload): Promise<ClubOfficial> {
  const { data, error } = await getSupabaseAdminClient()
    .from("club_officials")
    .insert({ ...officialPayloadToRow(input), is_active: input.isActive ?? true })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create official: ${error.message}`);
  }

  return data as ClubOfficial;
}

export async function updateOfficial(id: string, input: AdminOfficialPayload): Promise<ClubOfficial> {
  const { data, error } = await getSupabaseAdminClient()
    .from("club_officials")
    .update(officialPayloadToRow(input))
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to update official: ${error.message}`);
  }

  return data as ClubOfficial;
}

/** Supprime un dirigeant. Renvoie false si l'id n'existe pas (-> 404 côté route). */
export async function deleteOfficial(id: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdminClient()
    .from("club_officials")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    throw new Error(`Unable to delete official: ${error.message}`);
  }

  return (data ?? []).length > 0;
}
