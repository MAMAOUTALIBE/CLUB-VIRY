import type { NextRequest } from "next/server";

import { jsonError, jsonOk } from "@/lib/api/http";
import { evaluateScheduledAutomations } from "@/lib/db/scheduled-automations";
import { processDueReminders } from "@/lib/db/messaging";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Point d'entrée du planificateur (cron VPS). Protégé par un secret partagé (header
 * x-cron-key ou ?key=), PAS par une session admin. Traite les rappels échus et évalue
 * les règles conditionnelles. Renvoie 401 tant que CRON_SECRET n'est pas configuré.
 */
async function handle(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return jsonError(401, "AUTH_REQUIRED", "Planificateur non configuré.");
  }
  const provided = request.headers.get("x-cron-key") ?? request.nextUrl.searchParams.get("key");
  if (provided !== secret) {
    return jsonError(401, "AUTH_FAILED", "Clé de planificateur invalide.");
  }
  if (!isSupabaseAdminConfigured) {
    return jsonOk({ skipped: "no-database" });
  }
  const nowIso = new Date().toISOString();
  const reminders = await processDueReminders(nowIso);
  const automations = await evaluateScheduledAutomations(nowIso);
  return jsonOk({ reminders, automations, ranAt: nowIso });
}

export async function POST(request: NextRequest) {
  return handle(request);
}

// GET accepté aussi (certains crons ne font que des GET).
export async function GET(request: NextRequest) {
  return handle(request);
}
