import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import {
  isUuid,
  validateAdminFamilyAccessCreatePayload,
  validateAdminFamilyAccessLinkPayload,
  validateAdminFamilyAccessPasswordPayload,
  validateAdminFamilyAccessUnlinkPayload
} from "@/lib/api/validation";
import {
  createFamilyAccessAccountForAdmin,
  linkExistingFamilyAccessAccountForAdmin,
  listFamilyAccessAccountsForAdmin,
  resetFamilyAccessPasswordForAdmin,
  unlinkFamilyAccessAccountForAdmin
} from "@/lib/db/family-access";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function readFamilyId(context: RouteContext): Promise<string | null> {
  const { id } = await context.params;
  return isUuid(id) ? id : null;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "admin:manage_users");

  if (!admin.ok) return admin.response;

  const familyId = await readFamilyId(context);
  if (!familyId) return jsonError(400, "VALIDATION_ERROR", "Identifiant famille invalide.");

  try {
    const accounts = await listFamilyAccessAccountsForAdmin(familyId);
    if (accounts === null) return jsonError(404, "NOT_FOUND", "Famille introuvable.");
    return jsonOk({ accounts });
  } catch (error) {
    return handleDbError("admin/families/[id]/access", error);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "admin:manage_users");

  if (!admin.ok) return admin.response;

  const familyId = await readFamilyId(context);
  if (!familyId) return jsonError(400, "VALIDATION_ERROR", "Identifiant famille invalide.");

  const body = await readJsonBody(request);
  if (body === undefined) return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");

  const payload = validateAdminFamilyAccessCreatePayload(body);
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Accès famille invalide.", payload.issues);

  try {
    const result = await createFamilyAccessAccountForAdmin(familyId, payload.data);

    if (!result.ok) {
      return result.reason === "FAMILY_NOT_FOUND"
        ? jsonError(404, "NOT_FOUND", "Famille introuvable.")
        : jsonError(409, "CONFLICT", "Un compte existe déjà pour cet email. Utilisez le rattachement d’un compte existant.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "family.access_created",
      entityType: "families",
      entityId: familyId,
      metadata: { profileId: result.account.profileId }
    });

    return jsonOk({ account: result.account }, 201);
  } catch (error) {
    return handleDbError("admin/families/[id]/access:create", error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "admin:manage_users");

  if (!admin.ok) return admin.response;

  const familyId = await readFamilyId(context);
  if (!familyId) return jsonError(400, "VALIDATION_ERROR", "Identifiant famille invalide.");

  const body = await readJsonBody(request);
  if (body === undefined) return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");

  const payload = validateAdminFamilyAccessLinkPayload(body);
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Rattachement invalide.", payload.issues);

  try {
    const result = await linkExistingFamilyAccessAccountForAdmin(familyId, payload.data.email);

    if (!result.ok) {
      if (result.reason === "FAMILY_NOT_FOUND") return jsonError(404, "NOT_FOUND", "Famille introuvable.");
      if (result.reason === "ACCOUNT_NOT_FOUND") return jsonError(404, "NOT_FOUND", "Aucun compte ne correspond à cet email.");
      if (result.reason === "WRONG_ROLE") return jsonError(409, "CONFLICT", "Ce compte n’a pas le rôle Famille.");
      return jsonError(409, "CONFLICT", "Ce compte est déjà rattaché à cette famille.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "family.access_linked",
      entityType: "families",
      entityId: familyId,
      metadata: { profileId: result.account.profileId }
    });

    return jsonOk({ account: result.account });
  } catch (error) {
    return handleDbError("admin/families/[id]/access:link", error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "admin:manage_users");

  if (!admin.ok) return admin.response;

  const familyId = await readFamilyId(context);
  if (!familyId) return jsonError(400, "VALIDATION_ERROR", "Identifiant famille invalide.");

  const body = await readJsonBody(request);
  if (body === undefined) return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");

  const payload = validateAdminFamilyAccessPasswordPayload(body);
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Mot de passe invalide.", payload.issues);

  try {
    const updated = await resetFamilyAccessPasswordForAdmin(familyId, payload.data.profileId, payload.data.password);
    if (!updated) return jsonError(404, "NOT_FOUND", "Compte famille introuvable.");

    await recordActivity({
      actorId: admin.context.user.id,
      action: "family.access_password_reset",
      entityType: "families",
      entityId: familyId,
      metadata: { profileId: payload.data.profileId }
    });

    return jsonOk({ updated: true });
  } catch (error) {
    return handleDbError("admin/families/[id]/access:password", error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "admin:manage_users");

  if (!admin.ok) return admin.response;

  const familyId = await readFamilyId(context);
  if (!familyId) return jsonError(400, "VALIDATION_ERROR", "Identifiant famille invalide.");

  const body = await readJsonBody(request);
  if (body === undefined) return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");

  const payload = validateAdminFamilyAccessUnlinkPayload(body);
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Compte famille invalide.", payload.issues);

  try {
    const unlinked = await unlinkFamilyAccessAccountForAdmin(familyId, payload.data.profileId);
    if (!unlinked) return jsonError(404, "NOT_FOUND", "Compte famille introuvable.");

    await recordActivity({
      actorId: admin.context.user.id,
      action: "family.access_unlinked",
      entityType: "families",
      entityId: familyId,
      metadata: { profileId: payload.data.profileId }
    });

    return jsonOk({ unlinked: true });
  } catch (error) {
    return handleDbError("admin/families/[id]/access:unlink", error);
  }
}
