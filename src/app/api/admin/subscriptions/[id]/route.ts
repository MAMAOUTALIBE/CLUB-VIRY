import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { recordActivity } from "@/lib/db/foundations";
import { updateSubscriptionStatus } from "@/lib/db/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = ["ACTIVE", "SUSPENDED", "CANCELLED"] as const;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "admin:manage_users");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);
  const status = body && typeof body === "object" ? (body as Record<string, unknown>).status : undefined;

  if (typeof status !== "string" || !(STATUSES as readonly string[]).includes(status)) {
    return jsonError(400, "VALIDATION_ERROR", "Statut d'abonnement invalide (ACTIVE, SUSPENDED ou CANCELLED).");
  }

  const { id } = await context.params;

  try {
    await updateSubscriptionStatus(id, status as (typeof STATUSES)[number]);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "subscription.updated",
      entityType: "subscriptions",
      entityId: id,
      metadata: { status }
    });
    return jsonOk({ updated: true });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur mise a jour abonnement inconnue.");
  }
}
