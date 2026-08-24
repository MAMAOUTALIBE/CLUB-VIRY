import "server-only";

import type { AdminScheduledAutomationPayload } from "@/lib/api/validation";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import { queueNotification, type NotificationChannel } from "@/lib/db/notifications";
import { renderMessage } from "@/lib/messaging";
import type { ScheduledAutomation } from "@/lib/db/types";

export async function listScheduledAutomations(): Promise<ScheduledAutomation[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("scheduled_automations")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Unable to fetch scheduled automations: ${error.message}`);
  return (data ?? []) as ScheduledAutomation[];
}

function payloadToRow(input: AdminScheduledAutomationPayload) {
  return {
    ...(input.name ? { name: input.name } : {}),
    ...(input.conditionKey ? { condition_key: input.conditionKey } : {}),
    ...(input.thresholdDays !== undefined ? { threshold_days: input.thresholdDays } : {}),
    ...(input.channel ? { channel: input.channel } : {}),
    ...(input.templateId !== undefined ? { template_id: input.templateId || null } : {}),
    ...(input.recipientEmail !== undefined ? { recipient_email: input.recipientEmail || null } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {})
  };
}

export async function createScheduledAutomation(input: AdminScheduledAutomationPayload, createdBy: string): Promise<ScheduledAutomation> {
  const { data, error } = await getSupabaseAdminClient()
    .from("scheduled_automations")
    .insert({ ...payloadToRow(input), channel: input.channel ?? "IN_APP", is_active: input.isActive ?? true, created_by: createdBy })
    .select("*")
    .single();
  if (error) throw new Error(`Unable to create scheduled automation: ${error.message}`);
  return data as ScheduledAutomation;
}

export async function updateScheduledAutomation(id: string, input: AdminScheduledAutomationPayload): Promise<ScheduledAutomation | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("scheduled_automations")
    .update(payloadToRow(input))
    .eq("id", id)
    .is("deleted_at", null)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`Unable to update scheduled automation: ${error.message}`);
  return (data as ScheduledAutomation | null) ?? null;
}

const CHANNEL_MAP: Record<string, NotificationChannel | null> = { IN_APP: "in_app", EMAIL: "email", SMS: null };

/** Compte les enregistrements correspondant à une condition (lecture seule, jamais de mutation). */
async function countForCondition(conditionKey: string, cutoffIso: string): Promise<number> {
  const supabase = getSupabaseAdminClient();
  if (conditionKey === "registrations_stale") {
    const { count, error } = await supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .in("status", ["SUBMITTED", "IN_REVIEW", "MISSING_DOCUMENTS"])
      .lt("created_at", cutoffIso);
    if (error) throw new Error(`registrations_stale: ${error.message}`);
    return count ?? 0;
  }
  if (conditionKey === "recruitment_stale") {
    const { count, error } = await supabase
      .from("recruitment_applications")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "PENDING")
      .lt("created_at", cutoffIso);
    if (error) throw new Error(`recruitment_stale: ${error.message}`);
    return count ?? 0;
  }
  return 0;
}

/**
 * Évalue toutes les règles actives : compte les enregistrements correspondants et, s'il y en a,
 * envoie une notification (in-app immédiat / e-mail en file). AUCUNE donnée métier n'est modifiée.
 */
export async function evaluateScheduledAutomations(nowIso: string): Promise<{ evaluated: number; triggered: number; totalMatches: number }> {
  const supabase = getSupabaseAdminClient();
  const rules = await listScheduledAutomations();
  const active = rules.filter((r) => r.is_active);
  let triggered = 0;
  let totalMatches = 0;

  for (const rule of active) {
    const cutoff = new Date(new Date(nowIso).getTime() - rule.threshold_days * 86_400_000).toISOString();
    try {
      const count = await countForCondition(rule.condition_key, cutoff);
      if (count > 0) {
        totalMatches += count;
        triggered += 1;
        const vars = { count: String(count), jours: String(rule.threshold_days) };
        let subject = `Relance : ${rule.name}`;
        let body = `${count} élément(s) correspondent à la règle « ${rule.name} » (seuil ${rule.threshold_days} jours).`;
        if (rule.template_id) {
          const { data: tpl } = await supabase.from("message_templates").select("subject, body").eq("id", rule.template_id).maybeSingle();
          if (tpl) {
            if (tpl.subject) subject = renderMessage(tpl.subject as string, vars);
            if (tpl.body) body = renderMessage(tpl.body as string, vars);
          }
        }
        const channel = CHANNEL_MAP[rule.channel];
        if (channel) {
          await queueNotification({ recipientEmail: rule.recipient_email, channel, template: "scheduled_automation", subject, payload: { body, count, rule: rule.name } });
        }
      }
      await supabase.from("scheduled_automations").update({ last_run_at: nowIso, last_match_count: count }).eq("id", rule.id);
    } catch (error) {
      console.error("scheduled automation failed:", rule.id, error instanceof Error ? error.message : error);
    }
  }

  return { evaluated: active.length, triggered, totalMatches };
}
