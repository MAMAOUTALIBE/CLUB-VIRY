import "server-only";

import type { Permission } from "@/lib/auth/permissions";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";

/**
 * Corbeille générique pour les contenus éditoriaux « soft-deletables » (colonne
 * `deleted_at`). Chaque type déclare sa table, son libellé, la permission requise
 * pour restaurer/purger, et comment dériver un libellé lisible d'une ligne.
 */
export type TrashType = "news" | "partners" | "products" | "officials";

type TrashConfig = {
  table: string;
  label: string;
  permission: Permission;
  labelColumn: string;
};

export const TRASH_CONFIG: Record<TrashType, TrashConfig> = {
  news: { table: "news", label: "Actualité", permission: "content:manage", labelColumn: "title" },
  partners: { table: "partners", label: "Partenaire", permission: "partners:manage", labelColumn: "name" },
  products: { table: "products", label: "Produit", permission: "shop:manage", labelColumn: "name" },
  officials: { table: "club_officials", label: "Dirigeant", permission: "content:manage", labelColumn: "full_name" }
};

export function isTrashType(value: unknown): value is TrashType {
  return typeof value === "string" && value in TRASH_CONFIG;
}

export type TrashedItem = {
  type: TrashType;
  typeLabel: string;
  id: string;
  label: string;
  deletedAt: string;
};

/** Déplace une ligne vers la corbeille (deleted_at = maintenant). false si déjà supprimée / introuvable. */
export async function softDeleteRow(type: TrashType, id: string): Promise<boolean> {
  const { table } = TRASH_CONFIG[type];
  const { data, error } = await getSupabaseAdminClient()
    .from(table)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id");

  if (error) {
    throw new Error(`Unable to soft-delete ${table}: ${error.message}`);
  }

  return (data ?? []).length > 0;
}

/** Restaure une ligne de la corbeille (deleted_at = null). false si absente de la corbeille. */
export async function restoreRow(type: TrashType, id: string): Promise<boolean> {
  const { table } = TRASH_CONFIG[type];
  const { data, error } = await getSupabaseAdminClient()
    .from(table)
    .update({ deleted_at: null })
    .eq("id", id)
    .not("deleted_at", "is", null)
    .select("id");

  if (error) {
    throw new Error(`Unable to restore ${table}: ${error.message}`);
  }

  return (data ?? []).length > 0;
}

/** Supprime définitivement une ligne déjà dans la corbeille (jamais une ligne active). */
export async function purgeRow(type: TrashType, id: string): Promise<boolean> {
  const { table } = TRASH_CONFIG[type];
  const { data, error } = await getSupabaseAdminClient()
    .from(table)
    .delete()
    .eq("id", id)
    .not("deleted_at", "is", null)
    .select("id");

  if (error) {
    throw new Error(`Unable to purge ${table}: ${error.message}`);
  }

  return (data ?? []).length > 0;
}

/** Liste toutes les lignes en corbeille pour un type donné, plus récentes d'abord. */
export async function listTrashedByType(type: TrashType, limit = 100): Promise<TrashedItem[]> {
  const config = TRASH_CONFIG[type];
  const { data, error } = await getSupabaseAdminClient()
    .from(config.table)
    .select("*")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to list trashed ${config.table}: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const record = row as Record<string, unknown>;
    return {
      type,
      typeLabel: config.label,
      id: String(record.id),
      label: String(record[config.labelColumn] ?? "—"),
      deletedAt: String(record.deleted_at)
    };
  });
}

/** Agrège la corbeille de tous les types, triée par date de suppression décroissante. */
export async function listAllTrashed(limit = 100): Promise<TrashedItem[]> {
  const types = Object.keys(TRASH_CONFIG) as TrashType[];
  const results = await Promise.all(types.map((type) => listTrashedByType(type, limit)));
  return results.flat().sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
}
