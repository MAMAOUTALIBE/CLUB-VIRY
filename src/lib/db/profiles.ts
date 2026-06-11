import "server-only";

import type { AdminUserUpdatePayload, ProfileUpdatePayload } from "@/lib/api/validation";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { Profile, ProfileStatus } from "@/lib/db/types";
import type { AppRole } from "@/lib/auth/roles";

function profilePayloadToRow(input: ProfileUpdatePayload) {
  return {
    ...(input.firstName !== undefined ? { first_name: input.firstName ?? null } : {}),
    ...(input.lastName !== undefined ? { last_name: input.lastName ?? null } : {}),
    ...(input.displayName !== undefined ? { display_name: input.displayName ?? null } : {}),
    ...(input.phone !== undefined ? { phone: input.phone ?? null } : {}),
    ...(input.avatarUrl !== undefined ? { avatar_url: input.avatarUrl ?? null } : {}),
    ...(input.birthDate !== undefined ? { birth_date: input.birthDate ?? null } : {})
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
