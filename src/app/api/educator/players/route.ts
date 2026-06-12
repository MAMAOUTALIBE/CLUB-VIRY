import type { NextRequest } from "next/server";

import { getEducatorContext } from "@/lib/api/educator-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { listAssignablePlayers } from "@/lib/db/teams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Liste PII-minimisee des joueurs du club, pour le selecteur d'affectation educateur.
// On ne renvoie QUE prenom + nom + annee de naissance (jamais la date complete,
// la licence, les notes medicales, la famille).
export async function GET(request: NextRequest) {
  const educator = await getEducatorContext(request);

  if (!educator.ok) {
    return educator.response;
  }

  try {
    const rows = await listAssignablePlayers();
    const players = rows.map((p) => ({
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      birth_year: p.birth_date ? Number(p.birth_date.slice(0, 4)) : null
    }));
    return jsonOk({ players });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur joueurs educateur inconnue.");
  }
}
