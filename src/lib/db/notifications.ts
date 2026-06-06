import "server-only";

import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { NotificationLog, NotificationStatus } from "@/lib/db/types";

export type QueueNotificationInput = {
  recipientProfileId?: string | null;
  recipientEmail?: string | null;
  channel?: "email";
  template: string;
  subject?: string | null;
  payload?: Record<string, unknown>;
};

type SupabaseAdminClient = ReturnType<typeof getSupabaseAdminClient>;

export type NotificationDispatchResult = {
  id: string;
  status: "SENT" | "FAILED" | "SKIPPED";
  providerReference?: string;
  errorMessage?: string;
};

export type NotificationDispatchSummary = {
  providerConfigured: boolean;
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
  results: NotificationDispatchResult[];
};

export async function queueNotification(
  input: QueueNotificationInput,
  supabase: SupabaseAdminClient = getSupabaseAdminClient()
): Promise<NotificationLog> {
  const { data, error } = await supabase
    .from("notification_logs")
    .insert({
      recipient_profile_id: input.recipientProfileId ?? null,
      recipient_email: input.recipientEmail ?? null,
      channel: input.channel ?? "email",
      template: input.template,
      subject: input.subject ?? null,
      status: "QUEUED",
      payload: input.payload ?? {}
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to queue notification: ${error.message}`);
  }

  return data as NotificationLog;
}

export async function queueAdminNotification(
  input: Omit<QueueNotificationInput, "recipientEmail" | "recipientProfileId">,
  supabase: SupabaseAdminClient = getSupabaseAdminClient()
): Promise<NotificationLog> {
  return queueNotification(
    {
      ...input,
      recipientEmail: process.env.ADMIN_NOTIFICATIONS_EMAIL || null
    },
    supabase
  );
}

export async function listQueuedNotifications(limit = 20, supabase: SupabaseAdminClient = getSupabaseAdminClient()): Promise<NotificationLog[]> {
  const { data, error } = await supabase
    .from("notification_logs")
    .select("*")
    .eq("status", "QUEUED")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch queued notifications: ${error.message}`);
  }

  return (data ?? []) as NotificationLog[];
}

function readWebhookConfig() {
  return {
    url: process.env.NOTIFICATION_WEBHOOK_URL || process.env.EMAIL_PROVIDER_WEBHOOK_URL || null,
    secret: process.env.NOTIFICATION_WEBHOOK_SECRET || process.env.EMAIL_PROVIDER_WEBHOOK_SECRET || null
  };
}

function getReferenceFromProviderResponse(value: unknown): string | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const body = value as Record<string, unknown>;
  const reference = body.id ?? body.reference ?? body.messageId ?? body.providerReference;

  return typeof reference === "string" && reference.trim() ? reference.trim() : undefined;
}

async function readProviderResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

async function updateNotificationDispatchStatus(
  id: string,
  status: NotificationStatus,
  input: {
    providerReference?: string | null;
    errorMessage?: string | null;
    sentAt?: string | null;
  },
  supabase: SupabaseAdminClient
): Promise<void> {
  const { error } = await supabase
    .from("notification_logs")
    .update({
      status,
      provider_reference: input.providerReference ?? null,
      error_message: input.errorMessage ?? null,
      sent_at: input.sentAt ?? null
    })
    .eq("id", id)
    .eq("status", "QUEUED");

  if (error) {
    throw new Error(`Unable to update notification dispatch status: ${error.message}`);
  }
}

async function sendNotificationToWebhook(notification: NotificationLog, webhookUrl: string, webhookSecret: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (webhookSecret) {
    headers["X-Notification-Secret"] = webhookSecret;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      id: notification.id,
      recipientEmail: notification.recipient_email,
      recipientProfileId: notification.recipient_profile_id,
      channel: notification.channel,
      template: notification.template,
      subject: notification.subject,
      payload: notification.payload
    })
  });

  const providerResponse = await readProviderResponse(response);

  if (!response.ok) {
    return {
      ok: false as const,
      errorMessage:
        typeof providerResponse === "string" && providerResponse.trim()
          ? providerResponse.slice(0, 500)
          : `Notification provider returned HTTP ${response.status}.`
    };
  }

  return {
    ok: true as const,
    providerReference: getReferenceFromProviderResponse(providerResponse)
  };
}

export async function dispatchQueuedNotifications(
  limit = 20,
  supabase: SupabaseAdminClient = getSupabaseAdminClient()
): Promise<NotificationDispatchSummary> {
  const boundedLimit = Math.min(Math.max(limit, 1), 50);
  const queuedNotifications = await listQueuedNotifications(boundedLimit, supabase);
  const webhook = readWebhookConfig();

  if (!webhook.url) {
    return {
      providerConfigured: false,
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: queuedNotifications.length,
      results: queuedNotifications.map((notification) => ({
        id: notification.id,
        status: "SKIPPED",
        errorMessage: "Notification provider is not configured."
      }))
    };
  }

  const results: NotificationDispatchResult[] = [];

  for (const notification of queuedNotifications) {
    if (notification.channel !== "email") {
      const errorMessage = `Unsupported notification channel: ${notification.channel}.`;
      await updateNotificationDispatchStatus(notification.id, "FAILED", { errorMessage }, supabase);
      results.push({ id: notification.id, status: "FAILED", errorMessage });
      continue;
    }

    if (!notification.recipient_email) {
      const errorMessage = "Notification recipient email is missing.";
      await updateNotificationDispatchStatus(notification.id, "FAILED", { errorMessage }, supabase);
      results.push({ id: notification.id, status: "FAILED", errorMessage });
      continue;
    }

    try {
      const delivery = await sendNotificationToWebhook(notification, webhook.url, webhook.secret);

      if (!delivery.ok) {
        await updateNotificationDispatchStatus(notification.id, "FAILED", { errorMessage: delivery.errorMessage }, supabase);
        results.push({ id: notification.id, status: "FAILED", errorMessage: delivery.errorMessage });
        continue;
      }

      await updateNotificationDispatchStatus(
        notification.id,
        "SENT",
        {
          providerReference: delivery.providerReference ?? null,
          sentAt: new Date().toISOString()
        },
        supabase
      );
      results.push({ id: notification.id, status: "SENT", providerReference: delivery.providerReference });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Notification delivery failed.";
      await updateNotificationDispatchStatus(notification.id, "FAILED", { errorMessage }, supabase);
      results.push({ id: notification.id, status: "FAILED", errorMessage });
    }
  }

  return {
    providerConfigured: true,
    processed: results.length,
    sent: results.filter((result) => result.status === "SENT").length,
    failed: results.filter((result) => result.status === "FAILED").length,
    skipped: results.filter((result) => result.status === "SKIPPED").length,
    results
  };
}
