import "server-only";

import type { AdminCategoryPayload } from "@/lib/api/validation";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { Category } from "@/lib/db/types";

export async function listCategoriesForAdmin(limit = 100): Promise<Category[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("categories")
    .select("*")
    .order("order_index", { ascending: true })
    .order("name", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch categories: ${error.message}`);
  }

  return (data ?? []) as Category[];
}

function categoryPayloadToRow(input: AdminCategoryPayload) {
  return {
    ...(input.name ? { name: input.name } : {}),
    ...(input.ageRange ? { age_range: input.ageRange } : {}),
    ...(input.gender ? { gender: input.gender } : {}),
    ...(input.orderIndex !== undefined ? { order_index: input.orderIndex } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {})
  };
}

export async function createCategory(input: AdminCategoryPayload): Promise<Category> {
  const { data, error } = await getSupabaseAdminClient()
    .from("categories")
    .insert({ ...categoryPayloadToRow(input), gender: input.gender ?? "MIXTE", is_active: input.isActive ?? true })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create category: ${error.message}`);
  }

  return data as Category;
}

export async function updateCategory(id: string, input: AdminCategoryPayload): Promise<Category | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("categories")
    .update(categoryPayloadToRow(input))
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to update category: ${error.message}`);
  }

  return (data as Category | null) ?? null;
}
