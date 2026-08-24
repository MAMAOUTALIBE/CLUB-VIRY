import type { NextRequest } from "next/server";
import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateRolePermissionsPayload } from "@/lib/api/validation";
import { LOCKED_ROLES } from "@/lib/auth/permissions";
import { isAppRole } from "@/lib/auth/roles";
import { resetRolePermissions, saveRolePermissions } from "@/lib/auth/permission-overrides";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ role: string }> };

// Modifier les permissions d'un rôle est réservé au SUPER_ADMIN (évite l'auto-élévation
// d'un admin via la surcouche). Le SUPER_ADMIN lui-même est verrouillé (anti-lockout).
async function guard(request: NextRequest, role: string) {
  const admin = await getAdminContext(request, "admin:manage_users");
  if (!admin.ok) return { error: admin.response as ReturnType<typeof jsonError> } as const;
  if (admin.context.profile?.role !== "SUPER_ADMIN") {
    return { error: jsonError(403, "FORBIDDEN", "Seul un super administrateur peut modifier les permissions des rôles.") } as const;
  }
  if (!isAppRole(role)) {
    return { error: jsonError(400, "VALIDATION_ERROR", "Rôle inconnu.") } as const;
  }
  if (LOCKED_ROLES.includes(role)) {
    return { error: jsonError(409, "CONFLICT", "Ce rôle est verrouillé et ne peut pas être modifié.") } as const;
  }
  return { admin, role } as const;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { role } = await context.params;
  const g = await guard(request, role);
  if ("error" in g) return g.error;

  const body = await readJsonBody(request);
  if (body === undefined) return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  const payload = validateRolePermissionsPayload(body);
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Permissions invalides.", payload.issues);

  try {
    await saveRolePermissions(g.role, payload.data.permissions);
    await recordActivity({ actorId: g.admin.context.user.id, action: "role_permissions.updated", entityType: "role_permissions", entityId: g.role, metadata: { count: payload.data.permissions.length } });
    return jsonOk({ role: g.role, permissions: payload.data.permissions });
  } catch (error) {
    return handleDbError("admin/roles/[role] PUT", error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { role } = await context.params;
  const g = await guard(request, role);
  if ("error" in g) return g.error;
  try {
    await resetRolePermissions(g.role);
    await recordActivity({ actorId: g.admin.context.user.id, action: "role_permissions.reset", entityType: "role_permissions", entityId: g.role });
    return jsonOk({ role: g.role, reset: true });
  } catch (error) {
    return handleDbError("admin/roles/[role] DELETE", error);
  }
}
