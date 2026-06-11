import "server-only";

import type { User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

import type { ApiErrorCode } from "@/lib/api/http";
import { getBearerToken } from "@/lib/api/http";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";
import type { Profile } from "@/lib/db/types";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export type AuthContext = {
  token: string;
  user: User;
  profile: Profile | null;
};

export type AuthContextResult =
  | {
      ok: true;
      context: AuthContext;
    }
  | {
      ok: false;
      status: number;
      code: ApiErrorCode;
      message: string;
    };

export async function getAuthContext(request: NextRequest): Promise<AuthContextResult> {
  const token = getBearerToken(request) ?? request.cookies.get("admin_session")?.value ?? null;

  if (!token) {
    return { ok: false, status: 401, code: "AUTH_REQUIRED", message: "Session admin manquante." };
  }

  if (!isSupabaseConfigured) {
    return { ok: false, status: 503, code: "CONFIGURATION_ERROR", message: "Supabase Auth n'est pas encore configure." };
  }

  const { data, error } = await getSupabaseClient().auth.getUser(token);

  if (error || !data.user) {
    return { ok: false, status: 401, code: "AUTH_FAILED", message: error?.message ?? "Session invalide." };
  }

  let profile: Profile | null = null;

  if (isSupabaseAdminConfigured) {
    const { data: profileData, error: profileError } = await getSupabaseAdminClient()
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      return { ok: false, status: 500, code: "SUPABASE_ERROR", message: profileError.message };
    }

    profile = profileData as Profile | null;
  }

  return {
    ok: true,
    context: {
      token,
      user: data.user,
      profile
    }
  };
}
