import "server-only";

import { revalidateTag, unstable_cache } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";

export const SITE_SETTINGS_CACHE_TAG = "site-settings";

export type SettingValue = Record<string, unknown>;
export type SiteSettings = Record<string, SettingValue>;

async function fetchAllSettings(): Promise<SiteSettings> {
  const { data, error } = await getSupabaseAdminClient().from("site_settings").select("key, value");
  if (error) {
    throw new Error(`Unable to fetch site settings: ${error.message}`);
  }
  const out: SiteSettings = {};
  for (const row of (data ?? []) as Array<{ key: string; value: SettingValue }>) {
    out[row.key] = row.value ?? {};
  }
  return out;
}

// Le layout racine peut être pré-rendu. Ce cache taggué permet à Next de suivre
// la dépendance de toutes les pages aux réglages, puis de les régénérer après un PUT CRM.
export const getAllSettings = unstable_cache(fetchAllSettings, [SITE_SETTINGS_CACHE_TAG], {
  tags: [SITE_SETTINGS_CACHE_TAG],
  revalidate: 3600
});

export async function upsertSetting(key: string, value: SettingValue): Promise<void> {
  const { error } = await getSupabaseAdminClient()
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) {
    throw new Error(`Unable to save site setting: ${error.message}`);
  }
  // Route Handler Next 16 : expiration immédiate (updateTag est réservé aux Server Actions).
  revalidateTag(SITE_SETTINGS_CACHE_TAG, { expire: 0 });
}
