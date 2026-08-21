import "server-only";

import { revalidateTag, unstable_cache } from "next/cache";

import { AUTOMATION_CATALOG, type AutomationDefinition, type AutomationKey, type AutomationRunStatus } from "@/lib/automations";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { AutomationRule, AutomationRun } from "@/lib/db/types";

export const AUTOMATION_RULES_CACHE_TAG = "automation-rules";

export type AutomationRuleView = AutomationDefinition & {
  isEnabled: boolean;
  updatedAt: string | null;
  lastRun: AutomationRun | null;
};

async function fetchEnabledMap(): Promise<Record<string, boolean>> {
  const { data, error } = await getSupabaseAdminClient().from("automation_rules").select("key, is_enabled");

  if (error) {
    throw new Error(`Unable to fetch automation rules: ${error.message}`);
  }

  const out: Record<string, boolean> = {};
  for (const row of (data ?? []) as Array<{ key: string; is_enabled: boolean }>) {
    out[row.key] = row.is_enabled;
  }
  return out;
}

// Les règles sont lues à chaque notification : sans cache, chaque convocation
// paierait un aller-retour DB de plus. Le tag permet une expiration immédiate au toggle.
const getEnabledMap = unstable_cache(fetchEnabledMap, [AUTOMATION_RULES_CACHE_TAG], {
  tags: [AUTOMATION_RULES_CACHE_TAG],
  revalidate: 300
});

/**
 * Une règle inconnue en base, ou une base indisponible, vaut ACTIVE.
 * Le socle de notifications existait avant ce module : une table absente
 * (migration pas encore appliquée) ne doit surtout pas éteindre le club.
 */
export async function isAutomationEnabled(key: AutomationKey): Promise<boolean> {
  try {
    const map = await getEnabledMap();
    return map[key] ?? true;
  } catch (error) {
    console.error("isAutomationEnabled failed", { key, error });
    return true;
  }
}

export async function recordAutomationRun(input: {
  ruleKey: AutomationKey;
  status: AutomationRunStatus;
  message?: string | null;
  affectedCount?: number;
  context?: Record<string, unknown>;
}): Promise<void> {
  const { error } = await getSupabaseAdminClient().from("automation_runs").insert({
    rule_key: input.ruleKey,
    status: input.status,
    message: input.message ?? null,
    affected_count: input.affectedCount ?? 0,
    context: input.context ?? {}
  });

  if (error) {
    // Même règle d'or que le journal d'audit : tracer une exécution ne doit jamais
    // faire échouer l'action métier déjà réalisée.
    console.error("recordAutomationRun failed", { ruleKey: input.ruleKey, status: input.status, error });
  }
}

/**
 * Point d'entrée unique des automatisations : vérifie l'activation, exécute, journalise.
 * Ne relance JAMAIS l'erreur — une automatisation cassée ne doit pas casser l'action
 * métier qui l'a déclenchée (convocation enregistrée, actualité publiée, etc.).
 *
 * `action` renvoie le nombre d'éléments touchés (destinataires, envois) quand il a du sens.
 */
export async function runAutomation(
  key: AutomationKey,
  context: Record<string, unknown>,
  action: () => Promise<number | void>
): Promise<void> {
  if (!(await isAutomationEnabled(key))) {
    await recordAutomationRun({ ruleKey: key, status: "SKIPPED", message: "Règle désactivée depuis le CRM.", context });
    return;
  }

  try {
    const affected = await action();
    await recordAutomationRun({
      ruleKey: key,
      status: "SUCCESS",
      affectedCount: typeof affected === "number" ? affected : 0,
      context
    });
  } catch (error) {
    await recordAutomationRun({
      ruleKey: key,
      status: "FAILED",
      message: error instanceof Error ? error.message : String(error),
      context
    });
    console.error(`runAutomation(${key}) failed`, error);
  }
}

/** Catalogue enrichi de l'état en base et de la dernière exécution, pour l'écran CRM. */
export async function listAutomationRules(): Promise<AutomationRuleView[]> {
  const supabase = getSupabaseAdminClient();

  const [{ data: ruleRows, error: rulesError }, { data: runRows, error: runsError }] = await Promise.all([
    supabase.from("automation_rules").select("*"),
    supabase.from("automation_runs").select("*").order("created_at", { ascending: false }).limit(200)
  ]);

  if (rulesError) {
    throw new Error(`Unable to fetch automation rules: ${rulesError.message}`);
  }

  if (runsError) {
    throw new Error(`Unable to fetch automation runs: ${runsError.message}`);
  }

  const ruleByKey = new Map(((ruleRows ?? []) as AutomationRule[]).map((row) => [row.key, row]));
  const lastRunByKey = new Map<string, AutomationRun>();
  for (const run of (runRows ?? []) as AutomationRun[]) {
    // Les runs arrivent du plus récent au plus ancien : la première vue gagne.
    if (!lastRunByKey.has(run.rule_key)) {
      lastRunByKey.set(run.rule_key, run);
    }
  }

  return AUTOMATION_CATALOG.map((definition) => {
    const row = ruleByKey.get(definition.key);
    return {
      ...definition,
      isEnabled: row?.is_enabled ?? true,
      updatedAt: row?.updated_at ?? null,
      lastRun: lastRunByKey.get(definition.key) ?? null
    };
  });
}

export async function listAutomationRuns(options: { ruleKey?: AutomationKey; status?: AutomationRunStatus; limit?: number } = {}): Promise<AutomationRun[]> {
  let query = getSupabaseAdminClient()
    .from("automation_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(options.limit ?? 50, 1), 200));

  if (options.ruleKey) {
    query = query.eq("rule_key", options.ruleKey);
  }

  if (options.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Unable to fetch automation runs: ${error.message}`);
  }

  return (data ?? []) as AutomationRun[];
}

export async function setAutomationRuleEnabled(key: AutomationKey, isEnabled: boolean, actorId: string): Promise<void> {
  const { error } = await getSupabaseAdminClient()
    .from("automation_rules")
    .upsert({ key, is_enabled: isEnabled, updated_by: actorId, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) {
    throw new Error(`Unable to update automation rule: ${error.message}`);
  }

  // Route Handler Next 16 : expiration immédiate (updateTag est réservé aux Server Actions).
  revalidateTag(AUTOMATION_RULES_CACHE_TAG, { expire: 0 });
}
