import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { validateAdminCampaignPayload } from "@/lib/api/validation";
import { previewCampaignAudience } from "@/lib/db/campaigns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Compte les destinataires d'un public sans rien envoyer. Le CRM l'appelle pendant la
 * rédaction : envoyer à tout le club sans savoir combien de familles seront touchées
 * est le meilleur moyen de le faire une fois de trop.
 *
 * Le public est validé par le même validateur que la campagne (objet et message
 * factices) : une cible refusée à l'envoi ne doit pas être comptée ici.
 */
export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "communication:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const params = request.nextUrl.searchParams;
  const payload = validateAdminCampaignPayload({
    subject: "Apercu",
    body: "Apercu",
    audienceType: params.get("audienceType"),
    audienceId: params.get("audienceId") ?? undefined
  });

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Public invalide.", payload.issues);
  }

  try {
    const preview = await previewCampaignAudience({
      type: payload.data.audienceType,
      id: payload.data.audienceId ?? null
    });

    return jsonOk(preview);
  } catch (error) {
    return handleDbError("admin/campaigns/audience", error);
  }
}
