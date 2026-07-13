import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { isUuid } from "@/lib/api/validation";
import { requirePermission } from "@/lib/auth";
import type { AuthContext } from "@/lib/auth/session";
import { recordActivity } from "@/lib/db/foundations";
import type { TrashType } from "@/lib/db/soft-delete";
import { TRASH_CONFIG, isTrashType, purgeRow, restoreRow } from "@/lib/db/soft-delete";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    type: string;
    id: string;
  }>;
};

// Pages publiques à revalider quand un contenu réapparaît (restauration).
const REVALIDATE_PATHS: Record<TrashType, string[]> = {
  news: ["/", "/actualites"],
  partners: ["/", "/partenaires"],
  products: ["/boutique"],
  officials: ["/le-club/organigramme", "/le-club/bureau", "/le-club/dirigeants"]
};

/**
 * Authentifie (tout admin CRM) puis valide type/id et enfin la permission fine du
 * type concerné (content:manage / partners:manage / shop:manage). Ordre : auth d'abord,
 * pour qu'un appelant non authentifié reçoive 401 plutôt qu'une erreur de validation.
 */
async function authorize(request: NextRequest, rawType: string, id: string) {
  const admin = await getAdminContext(request, "admin:access");

  if (!admin.ok) {
    return { ok: false as const, response: admin.response };
  }

  if (!isTrashType(rawType) || !isUuid(id)) {
    return { ok: false as const, response: jsonError(400, "VALIDATION_ERROR", "Type ou identifiant invalide.") };
  }

  const access = requirePermission(admin.context, TRASH_CONFIG[rawType].permission);

  if (!access.ok) {
    return { ok: false as const, response: jsonError(access.status, access.code, access.message) };
  }

  return { ok: true as const, type: rawType, context: admin.context as AuthContext };
}

/** Restaure un contenu depuis la corbeille. */
export async function POST(request: NextRequest, context: RouteContext) {
  const { type: rawType, id } = await context.params;
  const auth = await authorize(request, rawType, id);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const restored = await restoreRow(auth.type, id);

    if (!restored) {
      return jsonError(404, "NOT_FOUND", "Élément introuvable dans la corbeille.");
    }

    await recordActivity({
      actorId: auth.context.user.id,
      action: `${auth.type}.restored`,
      entityType: TRASH_CONFIG[auth.type].table,
      entityId: id
    });

    for (const path of REVALIDATE_PATHS[auth.type]) {
      revalidatePath(path);
    }

    return jsonOk({ restored: true });
  } catch (error) {
    return handleDbError("admin/trash/[type]/[id]", error);
  }
}

/** Supprime définitivement un contenu déjà en corbeille. */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { type: rawType, id } = await context.params;
  const auth = await authorize(request, rawType, id);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const purged = await purgeRow(auth.type, id);

    if (!purged) {
      return jsonError(404, "NOT_FOUND", "Élément introuvable dans la corbeille.");
    }

    await recordActivity({
      actorId: auth.context.user.id,
      action: `${auth.type}.purged`,
      entityType: TRASH_CONFIG[auth.type].table,
      entityId: id
    });

    return jsonOk({ purged: true });
  } catch (error) {
    return handleDbError("admin/trash/[type]/[id]", error);
  }
}
