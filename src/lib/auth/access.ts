import "server-only";

import type { ApiErrorCode } from "@/lib/api/http";
import type { Permission } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/permissions";
import type { AuthContext } from "@/lib/auth/session";

export type AccessResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      status: number;
      code: ApiErrorCode;
      message: string;
    };

export function requirePermission(context: AuthContext, permission: Permission): AccessResult {
  const role = context.profile?.role;

  if (!role) {
    return { ok: false, status: 403, code: "FORBIDDEN", message: "Profil club introuvable." };
  }

  if (!hasPermission(role, permission)) {
    return { ok: false, status: 403, code: "FORBIDDEN", message: "Permission insuffisante." };
  }

  return { ok: true };
}
