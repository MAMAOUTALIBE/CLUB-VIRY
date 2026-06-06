import "server-only";

import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { Category, CreateActivityLogInput, Season } from "@/lib/db/types";

export async function getActiveSeason(): Promise<Season | null> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to fetch active season: ${error.message}`);
  }

  return data as Season | null;
}

export async function listActiveCategories(): Promise<Category[]> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(`Unable to fetch categories: ${error.message}`);
  }

  return (data ?? []) as Category[];
}

export async function recordActivity(input: CreateActivityLogInput): Promise<void> {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from("activity_logs").insert({
    actor_id: input.actorId ?? null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null
  });

  if (error) {
    throw new Error(`Unable to record activity: ${error.message}`);
  }
}
