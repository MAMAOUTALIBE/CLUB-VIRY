import "server-only";

import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";

/**
 * Réordonne des lignes en réécrivant leur `order_index` selon l'ordre des `ids`
 * fournis. On espace de 10 en 10 pour laisser de la place à des insertions manuelles
 * ultérieures. Utilisé par les endpoints de réorganisation du CRM (glisser-déposer).
 */
export async function reorderRows(table: string, ids: string[]): Promise<void> {
  const client = getSupabaseAdminClient();

  const results = await Promise.all(
    ids.map((id, index) => client.from(table).update({ order_index: index * 10 }).eq("id", id).select("id"))
  );

  const failure = results.find((result) => result.error);

  if (failure?.error) {
    throw new Error(`Unable to reorder ${table}: ${failure.error.message}`);
  }
}
