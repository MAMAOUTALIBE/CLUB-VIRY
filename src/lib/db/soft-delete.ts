import "server-only";

import type { Permission } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/permissions";
import type { AppRole } from "@/lib/auth/roles";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";

/**
 * Corbeille générique pour les contenus éditoriaux « soft-deletables » (colonne
 * `deleted_at`). Chaque type déclare sa table, son libellé, la permission requise
 * pour restaurer/purger, et comment dériver un libellé lisible d'une ligne.
 */
export type TrashType = "news" | "partners" | "products" | "officials" | "seasons" | "categories" | "teams" | "matches" | "events" | "albums" | "standings" | "players" | "families" | "subscriptions" | "registrations" | "recruitment" | "campaigns" | "custom_fields" | "reference_lists" | "reference_items" | "message_templates" | "reminders";

type TrashConfig = {
  table: string;
  label: string;
  permission: Permission;
  labelColumn: string;
  /** Colonnes concaténées quand aucune colonne unique ne porte un libellé lisible (prénom + nom). */
  labelColumns?: readonly string[];
  /**
   * Libellé emprunté à une table liée, quand la ligne elle-même n'en porte aucun.
   * Un dossier d'inscription n'a que des identifiants : sans le nom du joueur, la
   * corbeille afficherait des UUID et personne ne saurait ce qu'il restaure.
   */
  labelRelation?: { table: string; foreignKey: string; columns: readonly string[] };
  tracksDeletedBy?: boolean;
};

export const TRASH_CONFIG: Record<TrashType, TrashConfig> = {
  news: { table: "news", label: "Actualité", permission: "content:manage", labelColumn: "title" },
  partners: { table: "partners", label: "Partenaire", permission: "partners:manage", labelColumn: "name" },
  products: { table: "products", label: "Produit", permission: "shop:manage", labelColumn: "name" },
  officials: { table: "club_officials", label: "Dirigeant", permission: "content:manage", labelColumn: "full_name" },
  seasons: { table: "seasons", label: "Saison", permission: "teams:manage", labelColumn: "name", tracksDeletedBy: true },
  categories: { table: "categories", label: "Catégorie", permission: "teams:manage", labelColumn: "name", tracksDeletedBy: true },
  teams: { table: "teams", label: "Équipe", permission: "teams:manage", labelColumn: "name", tracksDeletedBy: true },
  matches: { table: "matches", label: "Match", permission: "teams:manage", labelColumn: "opponent_name", tracksDeletedBy: true },
  events: { table: "club_events", label: "Événement", permission: "teams:manage", labelColumn: "title", tracksDeletedBy: true },
  albums: { table: "media_albums", label: "Album", permission: "content:manage", labelColumn: "title", tracksDeletedBy: true },
  standings: { table: "standings", label: "Classement", permission: "teams:manage", labelColumn: "team_name", tracksDeletedBy: true },
  players: { table: "players", label: "Joueur", permission: "players:manage", labelColumn: "last_name", labelColumns: ["first_name", "last_name"], tracksDeletedBy: true },
  families: { table: "families", label: "Famille", permission: "players:manage", labelColumn: "name", tracksDeletedBy: true },
  subscriptions: { table: "subscriptions", label: "Abonnement", permission: "admin:manage_users", labelColumn: "type", tracksDeletedBy: true },
  registrations: {
    table: "registrations",
    label: "Dossier d'inscription",
    permission: "registrations:manage",
    labelColumn: "id",
    labelRelation: { table: "players", foreignKey: "player_id", columns: ["first_name", "last_name"] },
    tracksDeletedBy: true
  },
  campaigns: {
    table: "communication_campaigns",
    label: "Campagne",
    permission: "communication:manage",
    labelColumn: "subject",
    tracksDeletedBy: true
  },
  recruitment: {
    table: "recruitment_applications",
    label: "Candidature détection",
    permission: "players:manage",
    labelColumn: "last_name",
    labelColumns: ["first_name", "last_name"],
    tracksDeletedBy: true
  },
  custom_fields: {
    table: "custom_field_definitions",
    label: "Champ personnalisé",
    permission: "automations:manage",
    labelColumn: "label",
    tracksDeletedBy: true
  },
  reference_lists: {
    table: "reference_lists",
    label: "Liste de référence",
    permission: "automations:manage",
    labelColumn: "name",
    tracksDeletedBy: true
  },
  reference_items: {
    table: "reference_items",
    label: "Valeur de référence",
    permission: "automations:manage",
    labelColumn: "label",
    tracksDeletedBy: true
  },
  message_templates: {
    table: "message_templates",
    label: "Modèle de message",
    permission: "communication:manage",
    labelColumn: "name",
    tracksDeletedBy: true
  },
  reminders: {
    table: "scheduled_reminders",
    label: "Rappel planifié",
    permission: "communication:manage",
    labelColumn: "title",
    tracksDeletedBy: true
  }
};

/** Tables porteuses d'une colonne `deleted_at`, dérivées de la configuration ci-dessus. */
export const SOFT_DELETABLE_TABLES: ReadonlySet<string> = new Set(Object.values(TRASH_CONFIG).map((config) => config.table));

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

export type PurgeDependency = { table: string; column: string; count: number };
export const PURGE_DEPENDENCIES: Partial<Record<TrashType, Array<{ table: string; column: string }>>> = {
  seasons: [
    { table: "registrations", column: "season_id" }, { table: "teams", column: "season_id" }, { table: "matches", column: "season_id" }
  ],
  categories: [
    { table: "recruitment_applications", column: "category_id" }, { table: "registrations", column: "category_id" },
    { table: "players", column: "category_id" }, { table: "teams", column: "category_id" }
  ],
  teams: [
    { table: "club_events", column: "team_id" }, { table: "news", column: "team_id" }, { table: "team_staff", column: "team_id" },
    { table: "team_players", column: "team_id" }, { table: "matches", column: "team_id" },
    { table: "training_sessions", column: "team_id" }, { table: "media_assets", column: "team_id" }
  ],
  matches: [{ table: "match_callups", column: "match_id" }, { table: "match_convocations", column: "match_id" }],
  albums: [{ table: "media_assets", column: "album_id" }],
  players: [
    { table: "team_players", column: "player_id" }, { table: "registrations", column: "player_id" },
    { table: "player_guardians", column: "player_id" }, { table: "match_callups", column: "player_id" }
  ],
  families: [
    { table: "players", column: "family_id" }, { table: "registrations", column: "family_id" },
    { table: "family_members", column: "family_id" }
  ],
  registrations: [
    { table: "registration_documents", column: "registration_id" }, { table: "payments", column: "registration_id" }
  ]
};

export async function listPurgeDependencies(type: TrashType, id: string): Promise<PurgeDependency[]> {
  const checks = PURGE_DEPENDENCIES[type] ?? [];
  const results = await Promise.all(checks.map(async (dependency) => {
    const { count, error } = await getSupabaseAdminClient().from(dependency.table).select(dependency.column, { count: "exact", head: true }).eq(dependency.column, id);
    if (error) throw new Error(`Unable to check ${dependency.table}: ${error.message}`);
    return { ...dependency, count: count ?? 0 };
  }));
  return results.filter((dependency) => dependency.count > 0);
}

/** Déplace une ligne vers la corbeille (deleted_at = maintenant). false si déjà supprimée / introuvable. */
export async function softDeleteRow(type: TrashType, id: string, deletedBy?: string): Promise<boolean> {
  const { table, tracksDeletedBy } = TRASH_CONFIG[type];
  const { data, error } = await getSupabaseAdminClient()
    .from(table)
    .update({ deleted_at: new Date().toISOString(), ...(tracksDeletedBy && deletedBy ? { deleted_by: deletedBy } : {}) })
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
  const { table, tracksDeletedBy } = TRASH_CONFIG[type];
  const { data, error } = await getSupabaseAdminClient()
    .from(table)
    .update({ deleted_at: null, ...(tracksDeletedBy ? { deleted_by: null } : {}) })
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

  const rows = (data ?? []) as Record<string, unknown>[];
  const relatedLabels = await fetchRelatedLabels(config, rows);

  return rows.map((record) => ({
    type,
    typeLabel: config.label,
    id: String(record.id),
    label: rowLabel(config, record, relatedLabels),
    deletedAt: String(record.deleted_at)
  }));
}

/** Résout en une seule requête les libellés empruntés à une table liée (clé étrangère → libellé). */
async function fetchRelatedLabels(config: TrashConfig, rows: Record<string, unknown>[]): Promise<Map<string, string>> {
  const relation = config.labelRelation;
  const labels = new Map<string, string>();

  if (!relation || rows.length === 0) {
    return labels;
  }

  const ids = [...new Set(rows.map((row) => row[relation.foreignKey]).filter((value): value is string => typeof value === "string"))];

  if (ids.length === 0) {
    return labels;
  }

  const { data, error } = await getSupabaseAdminClient()
    .from(relation.table)
    .select(["id", ...relation.columns].join(","))
    .in("id", ids);

  if (error) {
    // La corbeille doit rester consultable même si la table liée est illisible :
    // on retombe sur le libellé brut de la ligne plutôt que d'échouer.
    console.error(`Unable to fetch trash labels from ${relation.table}: ${error.message}`);
    return labels;
  }

  for (const row of (data ?? []) as unknown as Record<string, unknown>[]) {
    const label = relation.columns.map((column) => row[column]).filter(Boolean).join(" ").trim();

    if (typeof row.id === "string" && label) {
      labels.set(row.id, label);
    }
  }

  return labels;
}

function rowLabel(config: TrashConfig, record: Record<string, unknown>, relatedLabels: Map<string, string>): string {
  const relation = config.labelRelation;

  if (relation) {
    const key = record[relation.foreignKey];
    const related = typeof key === "string" ? relatedLabels.get(key) : undefined;

    if (related) {
      return related;
    }
  }

  if (config.labelColumns) {
    return config.labelColumns.map((column) => record[column]).filter(Boolean).join(" ") || "—";
  }

  return String(record[config.labelColumn] ?? "—");
}

/** Agrège la corbeille de tous les types, triée par date de suppression décroissante. */
export async function listAllTrashed(limit = 100): Promise<TrashedItem[]> {
  const types = Object.keys(TRASH_CONFIG) as TrashType[];
  const results = await Promise.all(types.map((type) => listTrashedByType(type, limit)));
  return results.flat().sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
}

export function trashTypesForRole(role: AppRole): TrashType[] {
  return (Object.keys(TRASH_CONFIG) as TrashType[]).filter((type) => hasPermission(role, TRASH_CONFIG[type].permission));
}

export async function listAllowedTrashed(role: AppRole, limit = 100): Promise<TrashedItem[]> {
  const results = await Promise.all(trashTypesForRole(role).map((type) => listTrashedByType(type, limit)));
  return results.flat().sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
}
