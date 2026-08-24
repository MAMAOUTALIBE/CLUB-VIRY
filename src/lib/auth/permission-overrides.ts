import "server-only";

import { applyPermissionOverrides, type Permission } from "@/lib/auth/permissions";
import type { AppRole } from "@/lib/auth/roles";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

// Cache mémoire des surcharges, rafraîchi avec un TTL. Fail-safe : en cas d'erreur,
// on conserve la dernière map connue (au pire, les défauts du code).
const TTL_MS = 30_000;
let lastLoaded = 0;
let inFlight: Promise<void> | null = null;

/** Lit les surcharges en base et les regroupe par rôle. */
export async function listRolePermissionOverrides(): Promise<Partial<Record<AppRole, Permission[]>>> {
  const { data, error } = await getSupabaseAdminClient().from("role_permissions").select("role, permission");
  if (error) throw new Error(`Unable to fetch role permissions: ${error.message}`);
  const overrides: Partial<Record<AppRole, Permission[]>> = {};
  for (const row of data ?? []) {
    const role = row.role as AppRole;
    (overrides[role] ??= []).push(row.permission as Permission);
  }
  return overrides;
}

async function reload(): Promise<void> {
  try {
    applyPermissionOverrides(await listRolePermissionOverrides());
    lastLoaded = Date.now();
  } catch (error) {
    // On NE vide PAS la map : la dernière bonne valeur (ou les défauts) reste en vigueur.
    console.error("permission overrides reload failed:", error instanceof Error ? error.message : error);
  }
}

/**
 * Garantit que les permissions effectives sont à jour (TTL). Appelée aux points d'entrée
 * async déjà présents (getAuthContext, proxy) juste avant les contrôles synchrones.
 * No-op en mode vitrine (pas de base) : les défauts du code s'appliquent.
 */
export async function ensurePermissionsFresh(force = false): Promise<void> {
  if (!isSupabaseAdminConfigured) return;
  if (!force && Date.now() - lastLoaded < TTL_MS) return;
  if (inFlight) return inFlight;
  inFlight = reload().finally(() => { inFlight = null; });
  return inFlight;
}

/** Remplace la surcharge d'un rôle (liste complète), puis rafraîchit le cache immédiatement. */
export async function saveRolePermissions(role: AppRole, permissions: Permission[]): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error: delError } = await supabase.from("role_permissions").delete().eq("role", role);
  if (delError) throw new Error(`Unable to reset role permissions: ${delError.message}`);
  if (permissions.length > 0) {
    const { error: insError } = await supabase.from("role_permissions").insert(permissions.map((permission) => ({ role, permission })));
    if (insError) throw new Error(`Unable to save role permissions: ${insError.message}`);
  }
  await ensurePermissionsFresh(true);
}

/** Supprime la surcharge d'un rôle (retour aux défauts du code), puis rafraîchit. */
export async function resetRolePermissions(role: AppRole): Promise<void> {
  const { error } = await getSupabaseAdminClient().from("role_permissions").delete().eq("role", role);
  if (error) throw new Error(`Unable to delete role permissions: ${error.message}`);
  await ensurePermissionsFresh(true);
}
