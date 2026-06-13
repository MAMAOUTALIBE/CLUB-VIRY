import "server-only";

import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { NotificationCategory, NotificationLog, NotificationStatus } from "@/lib/db/types";

export type NotificationChannel = "email" | "in_app" | "push";

export type QueueNotificationInput = {
  recipientProfileId?: string | null;
  recipientEmail?: string | null;
  channel?: NotificationChannel;
  template: string;
  subject?: string | null;
  payload?: Record<string, unknown>;
  category?: NotificationCategory | null;
  link?: string | null;
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
  const channel = input.channel ?? "email";
  // L'in-app EST l'entrée du feed : on le marque livré (SENT) immédiatement, sans passer
  // par le dispatcher. Les autres canaux (email, push) restent en file (QUEUED).
  const inApp = channel === "in_app";

  const { data, error } = await supabase
    .from("notification_logs")
    .insert({
      recipient_profile_id: input.recipientProfileId ?? null,
      recipient_email: input.recipientEmail ?? null,
      channel,
      template: input.template,
      subject: input.subject ?? null,
      status: inApp ? "SENT" : "QUEUED",
      payload: input.payload ?? {},
      category: input.category ?? null,
      link: input.link ?? null,
      sent_at: inApp ? new Date().toISOString() : null
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

// Provider email transactionnel (Brevo par défaut). Renvoie null si non configuré.
function readEmailProviderConfig() {
  const apiKey = process.env.BREVO_API_KEY || process.env.EMAIL_API_KEY || null;
  const fromEmail = process.env.EMAIL_FROM || process.env.ADMIN_NOTIFICATIONS_EMAIL || null;
  if (!apiKey || !fromEmail) {
    return null;
  }
  return { apiKey, fromEmail, fromName: process.env.EMAIL_FROM_NAME || "ES Viry-Châtillon Football" };
}

function escapeHtml(value: string): string {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return value.replace(/[&<>"']/g, (char) => map[char] ?? char);
}

/** Rendu HTML simple et autonome d'un email de notification à partir du template + payload. */
function renderNotificationEmailHtml(notification: NotificationLog): string {
  const subject = escapeHtml(notification.subject ?? "Notification ES Viry-Châtillon Football");
  const payload = notification.payload ?? {};
  const lines: string[] = [];
  const addLine = (label: string, key: string) => {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      lines.push(`<p style="margin:4px 0;color:#334155"><strong>${escapeHtml(label)} :</strong> ${escapeHtml(value)}</p>`);
    }
  };
  addLine("Pour", "childFirstName");
  addLine("Quand", "dateLabel");
  addLine("Lieu", "location");
  addLine("Adversaire", "opponentName");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://esvirychatillonfootball.org";
  const link = typeof notification.link === "string" && notification.link ? `${siteUrl}${notification.link}` : siteUrl;

  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto">
  <div style="background:#002f1d;color:#f7c600;padding:16px 20px;font-weight:bold;font-size:18px">ES Viry-Châtillon Football</div>
  <div style="padding:20px;border:1px solid #e2e8f0;border-top:0">
    <h1 style="font-size:18px;color:#002f1d;margin:0 0 12px">${subject}</h1>
    ${lines.join("\n    ")}
    <p style="margin:20px 0 0"><a href="${escapeHtml(link)}" style="background:#f7c600;color:#002f1d;text-decoration:none;font-weight:bold;padding:10px 18px;border-radius:6px;display:inline-block">Voir dans mon espace</a></p>
  </div>
  <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:12px">Vous recevez cet email car vous êtes abonné aux communications du club. Gérez vos préférences dans votre espace membre.</p>
</div>`;
}

async function sendNotificationViaProvider(notification: NotificationLog, config: { apiKey: string; fromEmail: string; fromName: string }) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": config.apiKey, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: config.fromEmail, name: config.fromName },
      to: [{ email: notification.recipient_email }],
      subject: notification.subject ?? "Notification ES Viry-Châtillon Football",
      htmlContent: renderNotificationEmailHtml(notification)
    })
  });

  const providerResponse = await readProviderResponse(response);

  if (!response.ok) {
    return {
      ok: false as const,
      errorMessage:
        typeof providerResponse === "string" && providerResponse.trim() ? providerResponse.slice(0, 500) : `Email provider returned HTTP ${response.status}.`
    };
  }

  return { ok: true as const, providerReference: getReferenceFromProviderResponse(providerResponse) };
}

export async function dispatchQueuedNotifications(
  limit = 20,
  supabase: SupabaseAdminClient = getSupabaseAdminClient()
): Promise<NotificationDispatchSummary> {
  const boundedLimit = Math.min(Math.max(limit, 1), 50);
  const queuedNotifications = await listQueuedNotifications(boundedLimit, supabase);
  const provider = readEmailProviderConfig();
  const webhook = readWebhookConfig();

  if (!provider && !webhook.url) {
    return {
      providerConfigured: false,
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: queuedNotifications.length,
      results: queuedNotifications.map((notification) => ({
        id: notification.id,
        status: "SKIPPED",
        errorMessage: "Aucun provider email ni webhook configuré."
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
      const delivery = provider
        ? await sendNotificationViaProvider(notification, provider)
        : await sendNotificationToWebhook(notification, webhook.url as string, webhook.secret);

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
