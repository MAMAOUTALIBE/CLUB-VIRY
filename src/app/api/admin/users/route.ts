import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, parseLimit, readJsonBody } from "@/lib/api/http";
import { validateAdminUserInvitePayload } from "@/lib/api/validation";
import { canAdminUpdateProfile } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/roles";
import { recordActivity } from "@/lib/db/foundations";
import type { ProfileStatus } from "@/lib/db/types";
import { inviteClubUser, listProfilesForAdmin } from "@/lib/db/profiles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_USER_ROLES: readonly AppRole[] = [
  "SUPER_ADMIN",
  "ADMIN_CLUB",
  "DIRIGEANT",
  "EDUCATEUR",
  "FAMILLE",
  "JOUEUR",
  "MEMBRE",
  "PARTENAIRE",
  "VISITEUR"
];

const PROFILE_STATUSES: readonly ProfileStatus[] = ["ACTIVE", "PENDING", "SUSPENDED", "ARCHIVED"];

function parseRole(value: string | null): AppRole | undefined {
  return ADMIN_USER_ROLES.includes(value as AppRole) ? (value as AppRole) : undefined;
}

function parseStatus(value: string | null): ProfileStatus | undefined {
  return PROFILE_STATUSES.includes(value as ProfileStatus) ? (value as ProfileStatus) : undefined;
}

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:manage_users");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 100, 2000);
  const role = parseRole(request.nextUrl.searchParams.get("role"));
  const status = parseStatus(request.nextUrl.searchParams.get("status"));

  try {
    const users = await listProfilesForAdmin({ limit, role, status });
    return jsonOk({ users });
  } catch (error) {
    return handleDbError("admin/users", error);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:manage_users");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminUserInvitePayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Invitation invalide.", payload.issues);
  }

  const actorRole = admin.context.profile?.role;

  if (!actorRole) {
    return jsonError(403, "FORBIDDEN", "Profil club introuvable.");
  }

  // Même garde anti-élévation qu'à la mise à jour : inviter un rôle supérieur ou
  // égal au sien contournerait sinon l'interdiction d'en attribuer un.
  const guard = canAdminUpdateProfile({
    actorRole,
    actorId: admin.context.user.id,
    targetId: "",
    targetCurrentRole: payload.data.role,
    requestedRole: payload.data.role
  });

  if (!guard.ok) {
    // La garde parle de « modifier un compte » : ici le compte n'existe pas encore,
    // et le seul refus possible porte sur le rôle demandé.
    return jsonError(403, "FORBIDDEN", "Vous ne pouvez pas inviter un compte avec un role superieur ou egal au votre.");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  try {
    const result = await inviteClubUser({ ...payload.data, redirectTo: `${siteUrl}/definir-mot-de-passe` });

    if (!result.ok) {
      return jsonError(409, "CONFLICT", "Un compte existe deja pour cette adresse email.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "profile.invited",
      entityType: "profiles",
      entityId: result.profile.id,
      metadata: {
        role: result.profile.role,
        invitationSent: result.invitationSent
      }
    });

    return jsonOk(
      {
        profile: result.profile,
        invitationSent: result.invitationSent,
        invitationLink: result.invitationLink
      },
      201
    );
  } catch (error) {
    return handleDbError("admin/users", error);
  }
}
