import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonOk } from "@/lib/api/http";
import { listAssignableStaff } from "@/lib/db/profiles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Liste des membres du club à qui attribuer un dossier. Volontairement séparée de
 * /api/admin/users : attribuer n'est pas gérer des comptes, et exiger
 * `admin:manage_users` priverait le responsable sportif ou boutique de son propre
 * sélecteur d'attribution.
 */
export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:access");

  if (!admin.ok) {
    return admin.response;
  }

  try {
    return jsonOk({ assignees: await listAssignableStaff() });
  } catch (error) {
    return handleDbError("admin/assignees", error);
  }
}
