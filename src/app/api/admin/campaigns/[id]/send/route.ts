import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { isUuid } from "@/lib/api/validation";
import { sendCampaign } from "@/lib/db/campaigns";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const FAILURES = {
  NOT_FOUND: { status: 404, code: "NOT_FOUND" as const, message: "Campagne introuvable." },
  ALREADY_SENT: { status: 409, code: "CONFLICT" as const, message: "Cette campagne a deja ete envoyee." },
  NO_RECIPIENT: { status: 409, code: "CONFLICT" as const, message: "Ce public ne compte aucun destinataire actif." }
};

/**
 * Envoie la campagne : une notification par destinataire rejoint la file, puis part
 * au prochain traitement (bouton « Traiter la file » ou cron). Le brouillon passe à
 * SENT de façon atomique — deux clics simultanés n'envoient pas deux fois.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "communication:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  if (!isUuid(id)) {
    return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  }

  try {
    const result = await sendCampaign(id, admin.context.user.id);

    if (!result.ok) {
      const failure = FAILURES[result.reason];
      return jsonError(failure.status, failure.code, failure.message);
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "campaign.sent",
      entityType: "communication_campaigns",
      entityId: result.campaign.id,
      metadata: {
        audienceType: result.campaign.audience_type,
        recipients: result.campaign.recipient_count,
        emails: result.campaign.email_count
      }
    });

    return jsonOk({ campaign: result.campaign });
  } catch (error) {
    return handleDbError("admin/campaigns/[id]/send", error);
  }
}
