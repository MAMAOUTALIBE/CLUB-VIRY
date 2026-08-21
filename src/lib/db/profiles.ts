import "server-only";

import type { AdminUserInvitePayload, AdminUserUpdatePayload, ProfileUpdatePayload } from "@/lib/api/validation";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { Profile, ProfileStatus } from "@/lib/db/types";
import type { AppRole } from "@/lib/auth/roles";

/** Bannissement « permanent » côté Supabase Auth (100 ans) : GoTrue n'a pas de durée infinie. */
const BAN_DURATION = "876000h";

/** Statuts qui coupent l'accès : le compte reste en base mais ne peut plus ouvrir de session. */
const BLOCKED_STATUSES: readonly ProfileStatus[] = ["SUSPENDED", "ARCHIVED"];

export function isBlockedProfileStatus(status: ProfileStatus): boolean {
  return BLOCKED_STATUSES.includes(status);
}

function profilePayloadToRow(input: ProfileUpdatePayload) {
  return {
    ...(input.firstName !== undefined ? { first_name: input.firstName ?? null } : {}),
    ...(input.lastName !== undefined ? { last_name: input.lastName ?? null } : {}),
    ...(input.displayName !== undefined ? { display_name: input.displayName ?? null } : {}),
    ...(input.phone !== undefined ? { phone: input.phone ?? null } : {}),
    ...(input.avatarUrl !== undefined ? { avatar_url: input.avatarUrl ?? null } : {}),
    ...(input.birthDate !== undefined ? { birth_date: input.birthDate ?? null } : {}),
    ...(input.publicProfile !== undefined ? { public_profile: input.publicProfile } : {}),
    ...(input.publicTitle !== undefined ? { public_title: input.publicTitle ?? null } : {}),
    ...(input.publicDiploma !== undefined ? { public_diploma: input.publicDiploma ?? null } : {}),
    ...(input.publicJoinedYear !== undefined ? { public_joined_year: input.publicJoinedYear ?? null } : {}),
    ...(input.publicDiplomas !== undefined ? { public_diplomas: input.publicDiplomas ?? [] } : {}),
    ...(input.publicSpecialties !== undefined ? { public_specialties: input.publicSpecialties ?? [] } : {}),
    ...(input.publicQuote !== undefined ? { public_quote: input.publicQuote ?? null } : {}),
    ...(input.publicBio !== undefined ? { public_bio: input.publicBio ?? null } : {})
  };
}

function adminUserPayloadToRow(input: AdminUserUpdatePayload) {
  return {
    ...profilePayloadToRow(input),
    ...(input.role !== undefined ? { role: input.role } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.email !== undefined ? { email: input.email } : {})
  };
}

export async function updateOwnProfile(profileId: string, input: ProfileUpdatePayload): Promise<Profile> {
  const { data, error } = await getSupabaseAdminClient()
    .from("profiles")
    .update(profilePayloadToRow(input))
    .eq("id", profileId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to update profile: ${error.message}`);
  }

  return data as Profile;
}

export async function listProfilesForAdmin(options: { limit?: number; role?: AppRole; status?: ProfileStatus } = {}): Promise<Profile[]> {
  let query = getSupabaseAdminClient()
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(options.limit ?? 100);

  if (options.role) {
    query = query.eq("role", options.role);
  }

  if (options.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Unable to fetch profiles: ${error.message}`);
  }

  return (data ?? []) as Profile[];
}

export async function getProfileForAdmin(profileId: string): Promise<Profile | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to fetch profile: ${error.message}`);
  }

  return (data as Profile | null) ?? null;
}

export async function updateProfileForAdmin(profileId: string, input: AdminUserUpdatePayload): Promise<Profile> {
  const { data, error } = await getSupabaseAdminClient()
    .from("profiles")
    .update(adminUserPayloadToRow(input))
    .eq("id", profileId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to update admin profile: ${error.message}`);
  }

  return data as Profile;
}

/** Les emails sont stockés en minuscules (GoTrue les normalise) : la comparaison est exacte. */
export async function findProfileByEmail(email: string): Promise<Profile | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("profiles")
    .select("*")
    .eq("email", email)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to fetch profile by email: ${error.message}`);
  }

  return (data as Profile | null) ?? null;
}

/**
 * GoTrue n'expose pas de recherche par email : on pagine l'annuaire des comptes.
 * Sert à repérer un compte d'authentification orphelin (sans ligne `profiles`),
 * cas rare mais qui ferait échouer l'invitation avec une erreur illisible.
 */
async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const supabase = getSupabaseAdminClient();
  const perPage = 200;
  const needle = email.toLowerCase();

  for (let page = 1; page <= 25; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw new Error(`Unable to list auth users: ${error.message}`);
    }

    const match = data.users.find((user) => user.email?.toLowerCase() === needle);

    if (match) {
      return match.id;
    }

    if (data.users.length < perPage) {
      return null;
    }
  }

  return null;
}

function isAlreadyRegistered(error: { message?: string; code?: string } | null): boolean {
  const message = error?.message?.toLowerCase() ?? "";
  return error?.code === "email_exists" || message.includes("already registered") || message.includes("already been registered");
}

export type InviteClubUserResult =
  | { ok: false; reason: "ALREADY_EXISTS" }
  | { ok: true; profile: Profile; invitationSent: boolean; invitationLink: string | null };

/**
 * Crée un compte club et lui envoie une invitation par email.
 *
 * Le club auto-héberge Supabase : le SMTP peut ne pas être configuré, et l'envoi
 * échoue alors que le compte, lui, est créé. Plutôt que de laisser un compte fantôme
 * derrière une erreur, on retombe sur un lien d'invitation à transmettre à la main
 * (`invitationSent: false`) — l'invitation reste utilisable sans serveur d'envoi.
 */
export async function inviteClubUser(input: AdminUserInvitePayload & { redirectTo: string }): Promise<InviteClubUserResult> {
  const supabase = getSupabaseAdminClient();
  const email = input.email.toLowerCase();

  if (await findProfileByEmail(email)) {
    return { ok: false, reason: "ALREADY_EXISTS" };
  }

  if (await findAuthUserIdByEmail(email)) {
    return { ok: false, reason: "ALREADY_EXISTS" };
  }

  const displayName = input.displayName ?? [input.firstName, input.lastName].filter(Boolean).join(" ");
  const metadata = {
    first_name: input.firstName ?? null,
    last_name: input.lastName ?? null,
    display_name: displayName || email,
    role: input.role
  };

  let invitationSent = true;
  let invitationLink: string | null = null;

  const invited = await supabase.auth.admin.inviteUserByEmail(email, { data: metadata, redirectTo: input.redirectTo });
  let authUserId = invited.data?.user?.id ?? null;

  if (invited.error) {
    if (isAlreadyRegistered(invited.error)) {
      return { ok: false, reason: "ALREADY_EXISTS" };
    }

    console.error("inviteUserByEmail failed, falling back to a manual link:", invited.error.message);
    invitationSent = false;

    // L'invitation a pu créer le compte avant d'échouer à l'envoi : dans ce cas
    // le lien d'invitation est refusé et c'est un lien de définition de mot de
    // passe (recovery) qui prend le relais.
    const inviteLink = await supabase.auth.admin.generateLink({
      type: "invite",
      email,
      options: { data: metadata, redirectTo: input.redirectTo }
    });

    if (inviteLink.error && !isAlreadyRegistered(inviteLink.error)) {
      throw new Error(`Unable to invite user: ${inviteLink.error.message}`);
    }

    if (inviteLink.error) {
      const recoveryLink = await supabase.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo: input.redirectTo }
      });

      if (recoveryLink.error) {
        throw new Error(`Unable to invite user: ${recoveryLink.error.message}`);
      }

      invitationLink = recoveryLink.data.properties?.action_link ?? null;
      authUserId = recoveryLink.data.user?.id ?? null;
    } else {
      invitationLink = inviteLink.data.properties?.action_link ?? null;
      authUserId = inviteLink.data.user?.id ?? null;
    }
  }

  if (!authUserId) {
    throw new Error("Unable to invite user: missing auth user id");
  }

  // Le déclencheur `handle_new_auth_user` a déjà créé la ligne profil à partir des
  // métadonnées ; on la réécrit pour faire foi sur le rôle, le statut et le téléphone.
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: authUserId,
        email,
        role: input.role,
        status: "ACTIVE" satisfies ProfileStatus,
        first_name: input.firstName ?? null,
        last_name: input.lastName ?? null,
        display_name: displayName || email,
        phone: input.phone ?? null
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create invited profile: ${error.message}`);
  }

  return { ok: true, profile: data as Profile, invitationSent, invitationLink };
}

/**
 * Répercute le statut du profil sur le compte Supabase Auth : un compte suspendu ou
 * archivé est banni, ce qui invalide ses jetons de rafraîchissement — sans quoi une
 * session déjà ouverte survivrait à la désactivation. L'échec est journalisé sans
 * casser la requête : le blocage reste assuré par la session et par la connexion.
 */
export async function syncAuthAccountAccess(userId: string, status: ProfileStatus): Promise<void> {
  const { error } = await getSupabaseAdminClient().auth.admin.updateUserById(userId, {
    ban_duration: isBlockedProfileStatus(status) ? BAN_DURATION : "none"
  });

  if (error) {
    console.error("syncAuthAccountAccess failed", { userId, status, message: error.message });
  }
}
