import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Couche de capture des demandes publiques (contact, inscription, recrutement)
 * qui fonctionne SANS Supabase, pour le lancement "vitrine".
 *
 * Deux canaux complementaires :
 *  1. Fichier JSONL local (garanti) : aucune demande n'est jamais perdue, meme
 *     sans aucune configuration. A lire dans le dossier `LEADS_DIR`.
 *  2. Webhook (optionnel) : si `NOTIFICATION_WEBHOOK_URL` est defini, la demande
 *     est aussi transmise en temps reel (ex. relais email, Make, Zapier, Discord).
 *
 * Quand Supabase est configure plus tard, les routes utilisent la base et ce
 * module n'est plus sollicite.
 */

export type LeadType = "contact" | "registration" | "recruitment" | "partnership";

export type LeadCaptureResult = {
  captured: boolean;
  storedToFile: boolean;
  forwardedToWebhook: boolean;
  reference: string;
};

type LeadMeta = {
  userAgent?: string | null;
  ip?: string | null;
};

function getLeadsDir(): string {
  const configured = process.env.LEADS_DIR?.trim();
  return configured && configured.length > 0 ? configured : path.join(process.cwd(), "var", "leads");
}

function readWebhookConfig() {
  return {
    url: process.env.NOTIFICATION_WEBHOOK_URL?.trim() || process.env.EMAIL_PROVIDER_WEBHOOK_URL?.trim() || null,
    secret: process.env.NOTIFICATION_WEBHOOK_SECRET?.trim() || process.env.EMAIL_PROVIDER_WEBHOOK_SECRET?.trim() || null
  };
}

function buildReference(type: LeadType): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${type}-${Date.now()}-${random}`;
}

/**
 * Anonymise une IP avant stockage (minimisation RGPD) :
 * IPv4 -> dernier octet masqué (1.2.3.0) ; IPv6 -> préfixe /48 conservé.
 */
function anonymizeIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const value = ip.trim();
  if (value.length === 0) return null;

  if (value.includes(".")) {
    const parts = value.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }

  if (value.includes(":")) {
    return `${value.split(":").slice(0, 3).join(":")}::`;
  }

  return null;
}

async function appendToFile(type: LeadType, record: Record<string, unknown>): Promise<void> {
  const dir = getLeadsDir();
  // Dossier privé (rwx pour le propriétaire uniquement) + fichiers non world-readable.
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  const file = path.join(dir, `${type}.jsonl`);
  await fs.appendFile(file, `${JSON.stringify(record)}\n`, { encoding: "utf8", mode: 0o600 });
  // Garantit les permissions même si le dossier/fichier préexistait avec des droits plus larges.
  await fs.chmod(dir, 0o700).catch(() => {});
  await fs.chmod(file, 0o600).catch(() => {});
}

async function forwardToWebhook(record: Record<string, unknown>): Promise<boolean> {
  const webhook = readWebhookConfig();

  if (!webhook.url) {
    return false;
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (webhook.secret) {
    headers["X-Notification-Secret"] = webhook.secret;
  }

  const response = await fetch(webhook.url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...record,
      recipientEmail: process.env.ADMIN_NOTIFICATIONS_EMAIL || null
    })
  });

  return response.ok;
}

export async function captureLead(
  type: LeadType,
  data: Record<string, unknown>,
  meta: LeadMeta = {}
): Promise<LeadCaptureResult> {
  const reference = buildReference(type);
  // Minimisation : on n'enregistre pas l'IP brute (RGPD, demandes pouvant concerner des mineurs).
  const safeMeta = {
    userAgent: meta.userAgent ?? null,
    ip: anonymizeIp(meta.ip)
  };
  const record = {
    reference,
    type,
    createdAt: new Date().toISOString(),
    data,
    meta: safeMeta
  };

  let storedToFile = false;
  let forwardedToWebhook = false;

  try {
    await appendToFile(type, record);
    storedToFile = true;
  } catch {
    storedToFile = false;
  }

  try {
    forwardedToWebhook = await forwardToWebhook(record);
  } catch {
    forwardedToWebhook = false;
  }

  return {
    captured: storedToFile || forwardedToWebhook,
    storedToFile,
    forwardedToWebhook,
    reference
  };
}
