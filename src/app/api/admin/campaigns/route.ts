import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, parseLimit, readJsonBody } from "@/lib/api/http";
import { validateAdminCampaignPayload } from "@/lib/api/validation";
import { createCampaign, listCampaigns } from "@/lib/db/campaigns";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "communication:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 50, 500);

  try {
    return jsonOk({ campaigns: await listCampaigns(limit) });
  } catch (error) {
    return handleDbError("admin/campaigns", error);
  }
}

/** Crée un brouillon. L'envoi est un second geste explicite (POST .../send). */
export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "communication:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminCampaignPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Campagne invalide.", payload.issues);
  }

  try {
    const campaign = await createCampaign(payload.data, admin.context.user.id);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "campaign.created",
      entityType: "communication_campaigns",
      entityId: campaign.id,
      metadata: { audienceType: campaign.audience_type, audienceId: campaign.audience_id }
    });

    return jsonOk({ campaign }, 201);
  } catch (error) {
    return handleDbError("admin/campaigns", error);
  }
}
