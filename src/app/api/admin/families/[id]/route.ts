import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { getFamilyDetailForAdmin } from "@/lib/db/family";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "players:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  try {
    const family = await getFamilyDetailForAdmin(id);

    if (!family) {
      return jsonError(404, "NOT_FOUND", "Famille introuvable.");
    }

    return jsonOk(family);
  } catch (error) {
    return handleDbError("admin/families/[id]", error);
  }
}
