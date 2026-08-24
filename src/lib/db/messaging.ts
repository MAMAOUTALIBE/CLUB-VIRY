import "server-only";

import type { AdminMessageTemplatePayload, AdminReminderPayload } from "@/lib/api/validation";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import { queueNotification, type NotificationChannel } from "@/lib/db/notifications";
import type { MessageTemplate, ScheduledReminder } from "@/lib/db/types";

// --- Modèles de messages -----------------------------------------------------

export async function listMessageTemplates(): Promise<MessageTemplate[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("message_templates")
    .select("*")
    .is("deleted_at", null)
    .order("order_index", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`Unable to fetch message templates: ${error.message}`);
  return (data ?? []) as MessageTemplate[];
}

function templatePayloadToRow(input: AdminMessageTemplatePayload) {
  return {
    ...(input.key ? { key: input.key } : {}),
    ...(input.name ? { name: input.name } : {}),
    ...(input.channel ? { channel: input.channel } : {}),
    ...(input.subject !== undefined ? { subject: input.subject || null } : {}),
    ...(input.body !== undefined ? { body: input.body } : {}),
    ...(input.description !== undefined ? { description: input.description || null } : {}),
    ...(input.orderIndex !== undefined ? { order_index: input.orderIndex } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {})
  };
}

export async function createMessageTemplate(input: AdminMessageTemplatePayload): Promise<MessageTemplate> {
  const { data, error } = await getSupabaseAdminClient()
    .from("message_templates")
    .insert({ ...templatePayloadToRow(input), channel: input.channel ?? "EMAIL", is_active: input.isActive ?? true })
    .select("*")
    .single();
  if (error) throw new Error(`Unable to create message template: ${error.message}`);
  return data as MessageTemplate;
}

export async function updateMessageTemplate(id: string, input: AdminMessageTemplatePayload): Promise<MessageTemplate | null> {
  const patch = { ...templatePayloadToRow(input) };
  delete (patch as { key?: string }).key; // la clé est structurante
  const { data, error } = await getSupabaseAdminClient()
    .from("message_templates")
    .update(patch)
    .eq("id", id)
    .is("deleted_at", null)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`Unable to update message template: ${error.message}`);
  return (data as MessageTemplate | null) ?? null;
}

// --- Rappels planifiés -------------------------------------------------------

export async function listReminders(limit = 200): Promise<ScheduledReminder[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("scheduled_reminders")
    .select("*")
    .is("deleted_at", null)
    .order("run_at", { ascending: true })
    .limit(limit);
  if (error) throw new Error(`Unable to fetch reminders: ${error.message}`);
  return (data ?? []) as ScheduledReminder[];
}

function reminderPayloadToRow(input: AdminReminderPayload) {
  return {
    ...(input.title ? { title: input.title } : {}),
    ...(input.channel ? { channel: input.channel } : {}),
    ...(input.templateId !== undefined ? { template_id: input.templateId || null } : {}),
    ...(input.subject !== undefined ? { subject: input.subject || null } : {}),
    ...(input.body !== undefined ? { body: input.body || null } : {}),
    ...(input.runAt ? { run_at: input.runAt } : {}),
    ...(input.recipientEmail !== undefined ? { recipient_email: input.recipientEmail || null } : {}),
    ...(input.status ? { status: input.status } : {})
  };
}

export async function createReminder(input: AdminReminderPayload, createdBy: string): Promise<ScheduledReminder> {
  const { data, error } = await getSupabaseAdminClient()
    .from("scheduled_reminders")
    .insert({ ...reminderPayloadToRow(input), channel: input.channel ?? "IN_APP", status: input.status ?? "PENDING", created_by: createdBy })
    .select("*")
    .single();
  if (error) throw new Error(`Unable to create reminder: ${error.message}`);
  return data as ScheduledReminder;
}

export async function updateReminder(id: string, input: AdminReminderPayload): Promise<ScheduledReminder | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("scheduled_reminders")
    .update(reminderPayloadToRow(input))
    .eq("id", id)
    .is("deleted_at", null)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`Unable to update reminder: ${error.message}`);
  return (data as ScheduledReminder | null) ?? null;
}

const CHANNEL_TO_NOTIFICATION: Record<string, NotificationChannel | null> = {
  IN_APP: "in_app",
  EMAIL: "email",
  SMS: null // Pas de canal SMS câblé (fournisseur SMS à configurer) : traité mais non expédié.
};

/**
 * Traite les rappels échus (status PENDING, run_at <= maintenant) : crée une notification
 * (in-app immédiat / e-mail mis en file) et marque le rappel « Envoyé ». Best-effort par rappel :
 * un échec isolé n'interrompt pas le lot. Renvoie le décompte.
 */
export async function processDueReminders(nowIso: string): Promise<{ processed: number; inApp: number; queuedEmail: number; smsPending: number }> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("scheduled_reminders")
    .select("*")
    .is("deleted_at", null)
    .eq("status", "PENDING")
    .lte("run_at", nowIso)
    .order("run_at", { ascending: true })
    .limit(200);
  if (error) throw new Error(`Unable to load due reminders: ${error.message}`);

  const due = (data ?? []) as ScheduledReminder[];
  let inApp = 0;
  let queuedEmail = 0;
  let smsPending = 0;

  for (const reminder of due) {
    let subject = reminder.subject;
    let body = reminder.body ?? "";
    if (reminder.template_id) {
      const { data: tpl } = await supabase.from("message_templates").select("subject, body").eq("id", reminder.template_id).maybeSingle();
      if (tpl) {
        subject = subject ?? (tpl.subject as string | null);
        if (!body) body = (tpl.body as string) ?? "";
      }
    }

    const channel = CHANNEL_TO_NOTIFICATION[reminder.channel];
    try {
      if (channel) {
        await queueNotification({
          recipientEmail: reminder.recipient_email,
          channel,
          template: "reminder",
          subject: subject ?? reminder.title,
          payload: { title: reminder.title, body }
        });
        if (channel === "in_app") inApp += 1;
        else queuedEmail += 1;
      } else {
        smsPending += 1;
      }
      await supabase.from("scheduled_reminders").update({ status: "SENT", sent_at: nowIso }).eq("id", reminder.id);
    } catch {
      // On laisse le rappel en PENDING pour un prochain passage.
    }
  }

  return { processed: due.length, inApp, queuedEmail, smsPending };
}
