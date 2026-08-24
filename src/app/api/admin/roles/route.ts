import type { NextRequest } from "next/server";
import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonOk } from "@/lib/api/http";
import { ALL_PERMISSIONS, LOCKED_ROLES, PERMISSION_LABELS, ROLE_PERMISSIONS } from "@/lib/auth/permissions";
import { APP_ROLES, ROLE_LABELS, roleRank } from "@/lib/auth/roles";
import { ensurePermissionsFresh, listRolePermissionOverrides } from "@/lib/auth/permission-overrides";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:manage_users");
  if (!admin.ok) return admin.response;
  try {
    await ensurePermissionsFresh(true);
    const overrides = await listRolePermissionOverrides();
    const roles = APP_ROLES.map((role) => {
      const locked = LOCKED_ROLES.includes(role);
      return {
        role,
        label: ROLE_LABELS[role],
        rank: roleRank(role),
        locked,
        overridden: !locked && Boolean(overrides[role]),
        permissions: locked ? [...ROLE_PERMISSIONS[role]] : overrides[role] ?? [...ROLE_PERMISSIONS[role]]
      };
    });
    const catalog = ALL_PERMISSIONS.map((permission) => ({ permission, label: PERMISSION_LABELS[permission] }));
    return jsonOk({ roles, catalog });
  } catch (error) {
    return handleDbError("admin/roles", error);
  }
}
