import "server-only";

import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";

export type SettingValue = Record<string, unknown>;
export type SiteSettings = Record<string, SettingValue>;

export async function getAllSettings(): Promise<SiteSettings> {
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

export async function upsertSetting(key: string, value: SettingValue): Promise<void> {
  const { error } = await getSupabaseAdminClient()
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) {
    throw new Error(`Unable to save site setting: ${error.message}`);
  }
}
