import "server-only";

import type { AdminReferenceItemPayload, AdminReferenceListPayload, EntityTagsPayload } from "@/lib/api/validation";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { EntityTag, ReferenceItem, ReferenceList } from "@/lib/db/types";

// --- Listes ------------------------------------------------------------------

export async function listReferenceLists(): Promise<ReferenceList[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("reference_lists")
    .select("*")
    .is("deleted_at", null)
    .order("order_index", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`Unable to fetch reference lists: ${error.message}`);
  return (data ?? []) as ReferenceList[];
}

function listPayloadToRow(input: AdminReferenceListPayload) {
  return {
    ...(input.key ? { key: input.key } : {}),
    ...(input.name ? { name: input.name } : {}),
    ...(input.description !== undefined ? { description: input.description || null } : {}),
    ...(input.kind ? { kind: input.kind } : {}),
    ...(input.appliesTo !== undefined ? { applies_to: input.appliesTo } : {}),
    ...(input.orderIndex !== undefined ? { order_index: input.orderIndex } : {})
  };
}

export async function createReferenceList(input: AdminReferenceListPayload): Promise<ReferenceList> {
  const { data, error } = await getSupabaseAdminClient()
    .from("reference_lists")
    .insert({ ...listPayloadToRow(input), kind: input.kind ?? "LABEL", applies_to: input.appliesTo ?? [] })
    .select("*")
    .single();
  if (error) throw new Error(`Unable to create reference list: ${error.message}`);
  return data as ReferenceList;
}

export async function updateReferenceList(id: string, input: AdminReferenceListPayload): Promise<ReferenceList | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("reference_lists")
    .update(listPayloadToRow(input))
    .eq("id", id)
    .is("deleted_at", null)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`Unable to update reference list: ${error.message}`);
  return (data as ReferenceList | null) ?? null;
}

/** Une liste système ne peut pas être supprimée (protège les référentiels amorcés). */
export async function isSystemReferenceList(id: string): Promise<boolean> {
  const { data } = await getSupabaseAdminClient().from("reference_lists").select("is_system").eq("id", id).maybeSingle();
  return Boolean(data?.is_system);
}

// --- Items -------------------------------------------------------------------

export async function listReferenceItems(listId: string): Promise<ReferenceItem[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("reference_items")
    .select("*")
    .eq("list_id", listId)
    .is("deleted_at", null)
    .order("order_index", { ascending: true })
    .order("label", { ascending: true });
  if (error) throw new Error(`Unable to fetch reference items: ${error.message}`);
  return (data ?? []) as ReferenceItem[];
}

function itemPayloadToRow(input: AdminReferenceItemPayload) {
  return {
    ...(input.listId ? { list_id: input.listId } : {}),
    ...(input.value ? { value: input.value } : {}),
    ...(input.label ? { label: input.label } : {}),
    ...(input.color !== undefined ? { color: input.color || null } : {}),
    ...(input.orderIndex !== undefined ? { order_index: input.orderIndex } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
    ...(input.isDefault !== undefined ? { is_default: input.isDefault } : {})
  };
}

export async function createReferenceItem(input: AdminReferenceItemPayload): Promise<ReferenceItem> {
  const { data, error } = await getSupabaseAdminClient()
    .from("reference_items")
    .insert({ ...itemPayloadToRow(input), is_active: input.isActive ?? true, is_default: input.isDefault ?? false })
    .select("*")
    .single();
  if (error) throw new Error(`Unable to create reference item: ${error.message}`);
  return data as ReferenceItem;
}

export async function updateReferenceItem(id: string, input: AdminReferenceItemPayload): Promise<ReferenceItem | null> {
  // La liste d'appartenance n'est jamais déplacée après création.
  const patch = { ...itemPayloadToRow(input) };
  delete (patch as { list_id?: string }).list_id;
  const { data, error } = await getSupabaseAdminClient()
    .from("reference_items")
    .update(patch)
    .eq("id", id)
    .is("deleted_at", null)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`Unable to update reference item: ${error.message}`);
  return (data as ReferenceItem | null) ?? null;
}

// --- Tags (application d'items à une fiche) -----------------------------------

/** Items TAG applicables à une entité (listes TAG dont applies_to contient l'entité, ou vide=global). */
export async function listTagOptionsForEntity(entityType: string): Promise<Array<ReferenceItem & { list_name: string }>> {
  const { data, error } = await getSupabaseAdminClient()
    .from("reference_items")
    .select("*, reference_lists!inner(name, kind, applies_to, deleted_at)")
    .is("deleted_at", null)
    .eq("is_active", true)
    .eq("reference_lists.kind", "TAG")
    .is("reference_lists.deleted_at", null)
    .order("order_index", { ascending: true });
  if (error) throw new Error(`Unable to fetch tag options: ${error.message}`);
  return ((data ?? []) as Array<ReferenceItem & { reference_lists: { name: string; applies_to: string[] } }>)
    .filter((row) => {
      const applies = row.reference_lists.applies_to ?? [];
      return applies.length === 0 || applies.includes(entityType);
    })
    .map((row) => ({ ...row, list_name: row.reference_lists.name }));
}

export async function getEntityTagIds(entityType: string, entityId: string): Promise<string[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("entity_tags")
    .select("item_id")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId);
  if (error) throw new Error(`Unable to fetch entity tags: ${error.message}`);
  return (data ?? []).map((r) => r.item_id as string);
}

/** Remplace l'ensemble des tags d'une fiche par la liste fournie (diff : ajoute/retire). */
export async function setEntityTags(entityType: string, entityId: string, itemIds: string[]): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const current = await getEntityTagIds(entityType, entityId);
  const target = new Set(itemIds);
  const toAdd = itemIds.filter((id) => !current.includes(id));
  const toRemove = current.filter((id) => !target.has(id));

  if (toAdd.length > 0) {
    const { error } = await supabase
      .from("entity_tags")
      .insert(toAdd.map((item_id) => ({ entity_type: entityType, entity_id: entityId, item_id })));
    if (error) throw new Error(`Unable to add entity tags: ${error.message}`);
  }
  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("entity_tags")
      .delete()
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .in("item_id", toRemove);
    if (error) throw new Error(`Unable to remove entity tags: ${error.message}`);
  }
}

export type { EntityTag };
