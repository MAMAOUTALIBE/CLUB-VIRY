import "server-only";

import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { NotificationCategory, NotificationLog } from "@/lib/db/types";

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = ["convocation", "session", "media", "news", "event"];

export function isNotificationCategory(value: unknown): value is NotificationCategory {
  return typeof value === "string" && (NOTIFICATION_CATEGORIES as string[]).includes(value);
}

// ----------------- Feed in-app -----------------

export async function listInAppNotifications(profileId: string, limit = 50): Promise<NotificationLog[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("notification_logs")
    .select("*")
    .eq("recipient_profile_id", profileId)
    .eq("channel", "in_app")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch notifications: ${error.message}`);
  }

  return (data ?? []) as NotificationLog[];
}

export async function countUnreadNotifications(profileId: string): Promise<number> {
  const { count, error } = await getSupabaseAdminClient()
    .from("notification_logs")
    .select("id", { count: "exact", head: true })
    .eq("recipient_profile_id", profileId)
    .eq("channel", "in_app")
    .is("read_at", null);

  if (error) {
    throw new Error(`Unable to count notifications: ${error.message}`);
  }

  return count ?? 0;
}

/** Marque comme lues toutes les notifs in-app non lues (ou seulement `ids` si fourni). */
export async function markNotificationsRead(profileId: string, ids?: string[]): Promise<void> {
  let query = getSupabaseAdminClient()
    .from("notification_logs")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_profile_id", profileId)
    .eq("channel", "in_app")
    .is("read_at", null);

  if (ids && ids.length > 0) {
    query = query.in("id", ids);
  }

  const { error } = await query;
  if (error) {
    throw new Error(`Unable to mark notifications read: ${error.message}`);
  }
}

// ----------------- Préférences -----------------

export type NotificationPreference = { category: NotificationCategory; email: boolean; push: boolean };

/** Renvoie les 5 catégories ; défaut = activé si aucune ligne enregistrée. */
export async function getNotificationPreferences(profileId: string): Promise<NotificationPreference[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("notification_preferences")
    .select("category, email, push")
    .eq("profile_id", profileId);

  if (error) {
    throw new Error(`Unable to fetch notification preferences: ${error.message}`);
  }

  const byCategory = new Map((data ?? []).map((r) => [(r as { category: NotificationCategory }).category, r as { email: boolean; push: boolean }]));

  return NOTIFICATION_CATEGORIES.map((category) => {
    const row = byCategory.get(category);
    return { category, email: row?.email ?? true, push: row?.push ?? true };
  });
}

export async function setNotificationPreference(
  profileId: string,
  category: NotificationCategory,
  channels: { email?: boolean; push?: boolean }
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("notification_preferences")
    .select("email, push")
    .eq("profile_id", profileId)
    .eq("category", category)
    .maybeSingle();

  const current = (existing as { email: boolean; push: boolean } | null) ?? { email: true, push: true };

  const { error } = await supabase.from("notification_preferences").upsert(
    {
      profile_id: profileId,
      category,
      email: channels.email ?? current.email,
      push: channels.push ?? current.push,
      updated_at: new Date().toISOString()
    },
    { onConflict: "profile_id,category" }
  );

  if (error) {
    throw new Error(`Unable to save notification preference: ${error.message}`);
  }
}
