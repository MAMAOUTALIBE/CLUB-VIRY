import "server-only";

import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

const PUBLIC_DB_TIMEOUT_MS = 1200;
const PUBLIC_DB_COOLDOWN_MS = 60_000;
const DB_TIMEOUT = Symbol("public-db-timeout");

let unavailableUntil = 0;

export function canUsePublicDb(): boolean {
  return isSupabaseAdminConfigured && Date.now() >= unavailableUntil;
}

export function markPublicDbUnavailable(): void {
  unavailableUntil = Date.now() + PUBLIC_DB_COOLDOWN_MS;
}

export async function readPublicDb<T>(operation: () => Promise<T>, timeoutMs = PUBLIC_DB_TIMEOUT_MS): Promise<T | null> {
  if (!canUsePublicDb()) {
    return null;
  }

  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    const result = await Promise.race<T | typeof DB_TIMEOUT>([
      operation(),
      new Promise<typeof DB_TIMEOUT>((resolve) => {
        timeout = setTimeout(() => resolve(DB_TIMEOUT), timeoutMs);
      })
    ]);

    if (result === DB_TIMEOUT) {
      markPublicDbUnavailable();
      return null;
    }

    return result;
  } catch {
    markPublicDbUnavailable();
    return null;
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
