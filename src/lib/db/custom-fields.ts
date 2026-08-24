import "server-only";

import type { AdminCustomFieldPayload, CustomFieldValuesPayload } from "@/lib/api/validation";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { CustomFieldDefinition, CustomFieldValue } from "@/lib/db/types";

/** Définitions d'une entité (ou toutes), hors corbeille. */
export async function listCustomFieldDefinitions(
  options: { entityType?: string; activeOnly?: boolean } = {}
): Promise<CustomFieldDefinition[]> {
  let query = getSupabaseAdminClient()
    .from("custom_field_definitions")
    .select("*")
    .is("deleted_at", null);

  if (options.entityType) {
    query = query.eq("entity_type", options.entityType);
  }
  if (options.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query
    .order("entity_type", { ascending: true })
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to fetch custom field definitions: ${error.message}`);
  }

  return (data ?? []) as CustomFieldDefinition[];
}

function definitionPayloadToRow(input: AdminCustomFieldPayload) {
  return {
    ...(input.entityType ? { entity_type: input.entityType } : {}),
    ...(input.key ? { key: input.key } : {}),
    ...(input.label ? { label: input.label } : {}),
    ...(input.type ? { type: input.type } : {}),
    ...(input.options !== undefined ? { options: input.options } : {}),
    ...(input.required !== undefined ? { required: input.required } : {}),
    ...(input.helpText !== undefined ? { help_text: input.helpText || null } : {}),
    ...(input.orderIndex !== undefined ? { order_index: input.orderIndex } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {})
  };
}

export async function createCustomFieldDefinition(input: AdminCustomFieldPayload): Promise<CustomFieldDefinition> {
  const { data, error } = await getSupabaseAdminClient()
    .from("custom_field_definitions")
    .insert({
      ...definitionPayloadToRow(input),
      options: input.options ?? [],
      required: input.required ?? false,
      is_active: input.isActive ?? true
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create custom field definition: ${error.message}`);
  }

  return data as CustomFieldDefinition;
}

export async function updateCustomFieldDefinition(
  id: string,
  input: AdminCustomFieldPayload
): Promise<CustomFieldDefinition | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("custom_field_definitions")
    .update(definitionPayloadToRow(input))
    .eq("id", id)
    .is("deleted_at", null)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to update custom field definition: ${error.message}`);
  }

  return (data as CustomFieldDefinition | null) ?? null;
}

/** Valeurs d'une fiche, indexées par clé de champ (uniquement champs actifs, hors corbeille). */
export async function getCustomFieldValues(
  entityType: string,
  entityId: string
): Promise<{ definitions: CustomFieldDefinition[]; values: Record<string, unknown> }> {
  const definitions = await listCustomFieldDefinitions({ entityType, activeOnly: true });

  const { data, error } = await getSupabaseAdminClient()
    .from("custom_field_values")
    .select("field_id, value")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId);

  if (error) {
    throw new Error(`Unable to fetch custom field values: ${error.message}`);
  }

  const byFieldId = new Map<string, unknown>((data ?? []).map((row) => [row.field_id as string, (row as { value: unknown }).value]));
  const values: Record<string, unknown> = {};
  for (const def of definitions) {
    if (byFieldId.has(def.id)) {
      values[def.key] = byFieldId.get(def.id);
    }
  }

  return { definitions, values };
}

/**
 * Écrit les valeurs d'une fiche (upsert par champ). `values` est indexé par clé de champ.
 * Un champ absent de `values` est laissé inchangé ; une valeur null/"" vide efface le champ.
 */
export async function setCustomFieldValues(
  entityType: string,
  entityId: string,
  values: Record<string, unknown>
): Promise<void> {
  const definitions = await listCustomFieldDefinitions({ entityType, activeOnly: true });
  const byKey = new Map(definitions.map((def) => [def.key, def]));
  const supabase = getSupabaseAdminClient();

  const toUpsert: { field_id: string; entity_type: string; entity_id: string; value: unknown }[] = [];
  const toClear: string[] = [];

  for (const [key, raw] of Object.entries(values)) {
    const def = byKey.get(key);
    if (!def) continue; // clé inconnue ignorée (robustesse)
    const isEmpty = raw === null || raw === undefined || raw === "" || (Array.isArray(raw) && raw.length === 0);
    if (isEmpty) {
      toClear.push(def.id);
    } else {
      toUpsert.push({ field_id: def.id, entity_type: entityType, entity_id: entityId, value: raw });
    }
  }

  if (toUpsert.length > 0) {
    const { error } = await supabase
      .from("custom_field_values")
      .upsert(toUpsert, { onConflict: "field_id,entity_id" });
    if (error) {
      throw new Error(`Unable to save custom field values: ${error.message}`);
    }
  }

  if (toClear.length > 0) {
    const { error } = await supabase
      .from("custom_field_values")
      .delete()
      .eq("entity_id", entityId)
      .in("field_id", toClear);
    if (error) {
      throw new Error(`Unable to clear custom field values: ${error.message}`);
    }
  }
}

export type { CustomFieldValuesPayload };
export type { CustomFieldValue };
