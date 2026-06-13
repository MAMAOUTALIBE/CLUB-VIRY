import "server-only";

import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";

export type SubscriptionType = "JOUEUR" | "FAMILLE" | "PARTENAIRE";
export type SubscriptionStatus = "ACTIVE" | "SUSPENDED" | "CANCELLED";

export type AdminSubscriptionRow = {
  id: string;
  profile_id: string;
  type: SubscriptionType;
  status: SubscriptionStatus;
  source: string | null;
  granted_at: string;
  created_at: string;
  profile_name: string;
  profile_email: string | null;
};

/** Crée ou réactive un abonnement (idempotent via unique(profile_id, type)). */
export async function ensureSubscription(profileId: string, type: SubscriptionType, source?: string): Promise<void> {
  const { error } = await getSupabaseAdminClient()
    .from("subscriptions")
    .upsert(
      { profile_id: profileId, type, status: "ACTIVE", source: source ?? null, updated_at: new Date().toISOString() },
      { onConflict: "profile_id,type" }
    );

  if (error) {
    throw new Error(`Unable to ensure subscription: ${error.message}`);
  }
}

export async function listSubscriptionsForAdmin(limit = 200): Promise<AdminSubscriptionRow[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch subscriptions: ${error.message}`);
  }

  const rows = (data ?? []) as Array<Omit<AdminSubscriptionRow, "profile_name" | "profile_email">>;
  if (rows.length === 0) {
    return [];
  }

  const profileIds = Array.from(new Set(rows.map((row) => row.profile_id)));
  const { data: profiles } = await supabase.from("profiles").select("id, display_name, first_name, last_name, email").in("id", profileIds);
  const byId = new Map(
    (profiles ?? []).map((p) => [
      (p as { id: string }).id,
      p as { display_name: string | null; first_name: string | null; last_name: string | null; email: string | null }
    ])
  );

  return rows.map((row) => {
    const profile = byId.get(row.profile_id);
    const display = profile?.display_name && !profile.display_name.includes("@") ? profile.display_name.trim() : "";
    const name = display || `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || profile?.email || "—";
    return { ...row, profile_name: name, profile_email: profile?.email ?? null };
  });
}

/** Renvoie false si aucun abonnement ne correspond à l'id (permet un 404 propre côté route). */
export async function updateSubscriptionStatus(id: string, status: SubscriptionStatus): Promise<boolean> {
  const { data, error } = await getSupabaseAdminClient()
    .from("subscriptions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id");

  if (error) {
    throw new Error(`Unable to update subscription: ${error.message}`);
  }

  return (data ?? []).length > 0;
}
