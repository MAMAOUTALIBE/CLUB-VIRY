import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, parseLimit, readJsonBody } from "@/lib/api/http";
import { validateAdminPartnerPayload } from "@/lib/api/validation";
import { createPartner, listPartnersForAdmin } from "@/lib/db/content";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "partners:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 100, 2000);

  try {
    const partners = await listPartnersForAdmin(limit);
    return jsonOk({ partners });
  } catch (error) {
    return handleDbError("admin/partners", error);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "partners:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminPartnerPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Partenaire invalide.", payload.issues);
  }

  try {
    const partner = await createPartner(payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "partner.created",
      entityType: "partners",
      entityId: partner.id,
      metadata: { name: partner.name, slug: partner.slug, tier: partner.tier }
    });
    revalidatePath("/");
    revalidatePath("/partenaires");

    return jsonOk({ partner }, 201);
  } catch (error) {
    return handleDbError("admin/partners", error);
  }
}
