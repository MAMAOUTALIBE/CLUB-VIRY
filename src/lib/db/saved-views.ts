import "server-only";

import type { AdminSavedViewPayload } from "@/lib/api/validation";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { SavedView } from "@/lib/db/types";

/** Vues d'un module visibles par l'utilisateur : les siennes + les vues partagées. */
export async function listSavedViews(scope: string, ownerId: string): Promise<SavedView[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("saved_views")
    .select("*")
    .eq("scope", scope)
    .or(`owner_id.eq.${ownerId},is_shared.eq.true`)
    .order("order_index", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`Unable to fetch saved views: ${error.message}`);
  return (data ?? []) as SavedView[];
}

export async function createSavedView(input: AdminSavedViewPayload, ownerId: string): Promise<SavedView> {
  const { data, error } = await getSupabaseAdminClient()
    .from("saved_views")
    .insert({
      scope: input.scope,
      name: input.name,
      owner_id: ownerId,
      is_shared: input.isShared ?? false,
      config: input.config ?? {}
    })
    .select("*")
    .single();
  if (error) throw new Error(`Unable to create saved view: ${error.message}`);
  return data as SavedView;
}

export async function updateSavedView(id: string, input: AdminSavedViewPayload, ownerId: string): Promise<SavedView | null> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.config !== undefined) patch.config = input.config;
  if (input.isShared !== undefined) patch.is_shared = input.isShared;
  if (input.orderIndex !== undefined) patch.order_index = input.orderIndex;

  const { data, error } = await getSupabaseAdminClient()
    .from("saved_views")
    .update(patch)
    .eq("id", id)
    // On ne modifie qu'une vue qu'on possède, ou une vue partagée.
    .or(`owner_id.eq.${ownerId},is_shared.eq.true`)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`Unable to update saved view: ${error.message}`);
  return (data as SavedView | null) ?? null;
}

export async function deleteSavedView(id: string, ownerId: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdminClient()
    .from("saved_views")
    .delete()
    .eq("id", id)
    .or(`owner_id.eq.${ownerId},is_shared.eq.true`)
    .select("id");
  if (error) throw new Error(`Unable to delete saved view: ${error.message}`);
  return (data ?? []).length > 0;
}
