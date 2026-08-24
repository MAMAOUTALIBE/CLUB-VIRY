/**
 * Catalogue partagé des champs personnalisés (Phase G).
 * Pur (aucune dépendance serveur) : réutilisé par les validateurs (serveur) ET
 * les écrans d'administration (client). La source de vérité des libellés/entités.
 */
import type { Permission } from "@/lib/auth/permissions";

export const CUSTOM_FIELD_ENTITIES = [
  { value: "player", label: "Joueur", permission: "players:manage" },
  { value: "family", label: "Famille", permission: "registrations:manage" },
  { value: "partner", label: "Partenaire", permission: "partners:manage" },
  { value: "recruitment_application", label: "Candidature recrutement", permission: "registrations:manage" },
  { value: "team", label: "Équipe", permission: "teams:manage" },
  { value: "news", label: "Actualité", permission: "content:manage" }
] as const satisfies ReadonlyArray<{ value: string; label: string; permission: Permission }>;

export type CustomFieldEntity = (typeof CUSTOM_FIELD_ENTITIES)[number]["value"];

export const CUSTOM_FIELD_ENTITY_VALUES = CUSTOM_FIELD_ENTITIES.map((e) => e.value) as readonly CustomFieldEntity[];

export function isCustomFieldEntity(value: unknown): value is CustomFieldEntity {
  return typeof value === "string" && CUSTOM_FIELD_ENTITY_VALUES.includes(value as CustomFieldEntity);
}

export function customFieldEntityLabel(value: string): string {
  return CUSTOM_FIELD_ENTITIES.find((e) => e.value === value)?.label ?? value;
}

/** Permission requise pour écrire les VALEURS de champs personnalisés d'une entité. */
export function customFieldEntityPermission(value: string): Permission | null {
  return CUSTOM_FIELD_ENTITIES.find((e) => e.value === value)?.permission ?? null;
}

export const CUSTOM_FIELD_TYPES = [
  { value: "TEXT", label: "Texte court" },
  { value: "TEXTAREA", label: "Texte long" },
  { value: "NUMBER", label: "Nombre" },
  { value: "BOOLEAN", label: "Oui / Non" },
  { value: "DATE", label: "Date" },
  { value: "SELECT", label: "Liste (choix unique)" },
  { value: "MULTISELECT", label: "Liste (choix multiple)" },
  { value: "EMAIL", label: "E-mail" },
  { value: "PHONE", label: "Téléphone" },
  { value: "URL", label: "Lien (URL)" }
] as const;

export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number]["value"];

export const CUSTOM_FIELD_TYPE_VALUES = CUSTOM_FIELD_TYPES.map((t) => t.value) as readonly CustomFieldType[];

/** Un type qui propose une liste d'options (SELECT / MULTISELECT). */
export function customFieldTypeHasOptions(type: string): boolean {
  return type === "SELECT" || type === "MULTISELECT";
}
