/**
 * Catalogue partagé des référentiels (Phase H). Pur (aucune dépendance serveur) :
 * réutilisé par les validateurs (serveur) et les écrans d'administration (client).
 */
export const REFERENCE_LIST_KINDS = [
  { value: "STATUS", label: "Statuts" },
  { value: "TAG", label: "Tags" },
  { value: "STAGE", label: "Étapes" },
  { value: "CATEGORY", label: "Catégories" },
  { value: "LABEL", label: "Étiquettes" }
] as const;

export type ReferenceListKind = (typeof REFERENCE_LIST_KINDS)[number]["value"];

export const REFERENCE_LIST_KIND_VALUES = REFERENCE_LIST_KINDS.map((k) => k.value) as readonly ReferenceListKind[];

export function referenceListKindLabel(value: string): string {
  return REFERENCE_LIST_KINDS.find((k) => k.value === value)?.label ?? value;
}
