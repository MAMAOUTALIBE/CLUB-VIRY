import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonOk } from "@/lib/api/http";
import { listAllTrashed } from "@/lib/db/soft-delete";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Corbeille : liste agrégée des contenus supprimés (restaurables), tous types confondus. */
export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "content:manage");

  if (!admin.ok) {
    return admin.response;
  }

  try {
    return jsonOk({ items: await listAllTrashed(100) });
  } catch (error) {
    return handleDbError("admin/trash", error);
  }
}
