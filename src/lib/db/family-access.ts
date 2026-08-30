import "server-only";

import type { AdminFamilyAccessCreatePayload } from "@/lib/api/validation";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { Family, FamilyMember, Profile } from "@/lib/db/types";

export type FamilyAccessAccount = {
  profileId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  status: Profile["status"];
  relationship: FamilyMember["relationship"];
  isPrimaryContact: boolean;
};

export type CreateFamilyAccessResult =
  | { ok: true; account: FamilyAccessAccount }
  | { ok: false; reason: "FAMILY_NOT_FOUND" | "ACCOUNT_EXISTS" };

export type LinkFamilyAccessResult =
  | { ok: true; account: FamilyAccessAccount }
  | { ok: false; reason: "FAMILY_NOT_FOUND" | "ACCOUNT_NOT_FOUND" | "WRONG_ROLE" | "ALREADY_LINKED" };

async function getActiveFamily(familyId: string): Promise<Family | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("families")
    .select("*")
    .eq("id", familyId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to fetch family access family: ${error.message}`);
  }

  return (data as Family | null) ?? null;
}

async function findProfileByEmail(email: string): Promise<Profile | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("profiles")
    .select("*")
    .eq("email", email.toLowerCase())
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to fetch family access profile: ${error.message}`);
  }

  return (data as Profile | null) ?? null;
}

async function authAccountExists(email: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  const needle = email.toLowerCase();
  const perPage = 200;

  for (let page = 1; page <= 25; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw new Error(`Unable to list family auth accounts: ${error.message}`);
    }

    if (data.users.some((user) => user.email?.toLowerCase() === needle)) {
      return true;
    }

    if (data.users.length < perPage) {
      return false;
    }
  }

  return false;
}

function toAccessAccount(profile: Profile, member: FamilyMember): FamilyAccessAccount {
  return {
    profileId: profile.id,
    email: profile.email,
    firstName: profile.first_name,
    lastName: profile.last_name,
    displayName: profile.display_name,
    status: profile.status,
    relationship: member.relationship,
    isPrimaryContact: member.is_primary_contact
  };
}

async function attachProfileToFamily(family: Family, profile: Profile): Promise<FamilyAccessAccount> {
  const supabase = getSupabaseAdminClient();
  const isPrimaryContact = family.primary_contact_id === null;
  const member: Omit<FamilyMember, "created_at"> = {
    family_id: family.id,
    profile_id: profile.id,
    relationship: "PARENT",
    is_primary_contact: isPrimaryContact
  };

  const { error: memberError } = await supabase.from("family_members").insert(member);

  if (memberError) {
    throw new Error(`Unable to attach family access account: ${memberError.message}`);
  }

  if (isPrimaryContact) {
    const { error: familyError } = await supabase
      .from("families")
      .update({ primary_contact_id: profile.id, updated_at: new Date().toISOString() })
      .eq("id", family.id)
      .is("deleted_at", null);

    if (familyError) {
      await supabase.from("family_members").delete().eq("family_id", family.id).eq("profile_id", profile.id);
      throw new Error(`Unable to set family primary contact: ${familyError.message}`);
    }
  }

  return toAccessAccount(profile, { ...member, created_at: new Date().toISOString() });
}

export async function listFamilyAccessAccountsForAdmin(familyId: string): Promise<FamilyAccessAccount[] | null> {
  const family = await getActiveFamily(familyId);

  if (!family) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const { data: members, error: membersError } = await supabase
    .from("family_members")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: true });

  if (membersError) {
    throw new Error(`Unable to list family access members: ${membersError.message}`);
  }

  const memberRows = (members ?? []) as FamilyMember[];
  const profileIds = memberRows.map((member) => member.profile_id);

  if (profileIds.length === 0) {
    return [];
  }

  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("id", profileIds);

  if (profilesError) {
    throw new Error(`Unable to list family access profiles: ${profilesError.message}`);
  }

  const profilesById = new Map(((profiles ?? []) as Profile[]).map((profile) => [profile.id, profile]));

  return memberRows.flatMap((member) => {
    const profile = profilesById.get(member.profile_id);
    return profile ? [toAccessAccount(profile, member)] : [];
  });
}

export async function createFamilyAccessAccountForAdmin(
  familyId: string,
  input: AdminFamilyAccessCreatePayload
): Promise<CreateFamilyAccessResult> {
  const family = await getActiveFamily(familyId);

  if (!family) {
    return { ok: false, reason: "FAMILY_NOT_FOUND" };
  }

  const email = input.email.toLowerCase();

  if ((await findProfileByEmail(email)) || (await authAccountExists(email))) {
    return { ok: false, reason: "ACCOUNT_EXISTS" };
  }

  const supabase = getSupabaseAdminClient();
  const displayName = [input.firstName, input.lastName].filter(Boolean).join(" ") || family.name;
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
      first_name: input.firstName ?? null,
      last_name: input.lastName ?? null,
      role: "FAMILLE"
    }
  });

  if (authError || !authData.user) {
    const message = authError?.message.toLowerCase() ?? "";
    if (authError?.code === "email_exists" || message.includes("already registered")) {
      return { ok: false, reason: "ACCOUNT_EXISTS" };
    }
    throw new Error(`Unable to create family auth account: ${authError?.message ?? "missing user"}`);
  }

  const profileRow = {
    id: authData.user.id,
    email,
    role: "FAMILLE" as const,
    status: "ACTIVE" as const,
    first_name: input.firstName ?? null,
    last_name: input.lastName ?? null,
    display_name: displayName
  };
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .upsert(profileRow, { onConflict: "id" })
    .select("*")
    .single();

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(`Unable to create family access profile: ${profileError.message}`);
  }

  try {
    return { ok: true, account: await attachProfileToFamily(family, profile as Profile) };
  } catch (error) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw error;
  }
}

export async function linkExistingFamilyAccessAccountForAdmin(familyId: string, email: string): Promise<LinkFamilyAccessResult> {
  const family = await getActiveFamily(familyId);

  if (!family) {
    return { ok: false, reason: "FAMILY_NOT_FOUND" };
  }

  const profile = await findProfileByEmail(email.toLowerCase());

  if (!profile) {
    return { ok: false, reason: "ACCOUNT_NOT_FOUND" };
  }

  if (profile.role !== "FAMILLE") {
    return { ok: false, reason: "WRONG_ROLE" };
  }

  const { data: existing, error: existingError } = await getSupabaseAdminClient()
    .from("family_members")
    .select("profile_id")
    .eq("family_id", familyId)
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Unable to verify family access membership: ${existingError.message}`);
  }

  if (existing) {
    return { ok: false, reason: "ALREADY_LINKED" };
  }

  return { ok: true, account: await attachProfileToFamily(family, profile) };
}

export async function resetFamilyAccessPasswordForAdmin(familyId: string, profileId: string, password: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  const { data: member, error: memberError } = await supabase
    .from("family_members")
    .select("profile_id")
    .eq("family_id", familyId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (memberError) {
    throw new Error(`Unable to verify family access password target: ${memberError.message}`);
  }

  if (!member) {
    return false;
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", profileId).maybeSingle();

  if (profileError) {
    throw new Error(`Unable to verify family access profile role: ${profileError.message}`);
  }

  if (!profile || profile.role !== "FAMILLE") {
    return false;
  }

  const { error } = await supabase.auth.admin.updateUserById(profileId, { password });

  if (error) {
    throw new Error(`Unable to reset family access password: ${error.message}`);
  }

  return true;
}

export async function unlinkFamilyAccessAccountForAdmin(familyId: string, profileId: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  const { data: member, error: memberError } = await supabase
    .from("family_members")
    .delete()
    .eq("family_id", familyId)
    .eq("profile_id", profileId)
    .select("profile_id")
    .maybeSingle();

  if (memberError) {
    throw new Error(`Unable to unlink family access account: ${memberError.message}`);
  }

  if (!member) {
    return false;
  }

  const { error: familyError } = await supabase
    .from("families")
    .update({ primary_contact_id: null, updated_at: new Date().toISOString() })
    .eq("id", familyId)
    .eq("primary_contact_id", profileId)
    .is("deleted_at", null);

  if (familyError) {
    throw new Error(`Unable to clear family primary contact: ${familyError.message}`);
  }

  return true;
}
