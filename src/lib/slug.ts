/**
 * Génère un slug URL à partir d'un texte (sans accents, minuscules, tirets).
 * Utilisable côté serveur et client (pas de dépendance Supabase).
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
