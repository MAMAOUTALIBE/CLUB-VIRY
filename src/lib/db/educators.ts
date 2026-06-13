import "server-only";

import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";

export type PublicEducatorTeam = {
  name: string;
  slug: string;
  category: string;
  roleTitle: string;
  isHeadCoach: boolean;
};

export type PublicEducatorRow = {
  id: string;
  name: string;
  avatar_url: string | null;
  title: string | null;
  bio: string | null;
  teams: PublicEducatorTeam[];
  team_count: number;
  session_count: number;
  match_count: number;
};

/**
 * Annuaire public des éducateurs (opt-in). Lit la fonction SQL `public_educators()`
 * qui ne projette que des champs publiables (jamais téléphone / email / date de naissance).
 */
export async function listPublicEducators(): Promise<PublicEducatorRow[]> {
  const { data, error } = await getSupabaseAdminClient().rpc("public_educators");

  if (error) {
    throw new Error(`Unable to fetch public educators: ${error.message}`);
  }

  return (data ?? []) as PublicEducatorRow[];
}
