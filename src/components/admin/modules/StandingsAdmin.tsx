"use client";

import { AdminCrud } from "@/components/admin/AdminCrud";

export function StandingsAdmin() {
  return (
    <AdminCrud
      title="Classements"
      description="Saisissez les classements des équipes (une ligne = une équipe dans une compétition). Ils s'affichent sur la page /resultats du site, regroupés par compétition. Cochez « Notre club » pour surligner l'ES Viry."
      endpoint="/api/admin/standings"
      listKey="standings"
      itemKey="standing"
      newLabel="Nouvelle ligne"
      allowDelete
      allowBulkDelete
      rowLabel={(r) => `« ${String(r.team_name ?? "cette ligne")} »`}
      fields={[
        { name: "competition", label: "Compétition", required: true, fullWidth: true, placeholder: "Seniors — Régional 1 Poule A" },
        { name: "teamName", label: "Équipe", rowKey: "team_name", required: true, fullWidth: true, placeholder: "ES Viry-Châtillon" },
        { name: "rank", label: "Rang", type: "number", placeholder: "1" },
        { name: "played", label: "Joués", type: "number" },
        { name: "won", label: "Gagnés", type: "number" },
        { name: "drawn", label: "Nuls", type: "number" },
        { name: "lost", label: "Perdus", type: "number" },
        { name: "goalsFor", label: "Buts pour", type: "number", rowKey: "goals_for" },
        { name: "goalsAgainst", label: "Buts contre", type: "number", rowKey: "goals_against" },
        { name: "points", label: "Points", type: "number" },
        { name: "isOwnClub", label: "Notre club (surligné)", type: "boolean", rowKey: "is_own_club" },
        { name: "isActive", label: "Affiché sur le site", type: "boolean", rowKey: "is_active" }
      ]}
      columns={[
        { label: "Compétition", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.competition ?? "—")}</span> },
        { label: "Équipe", render: (r) => (r.is_own_club ? <span className="font-black text-[#07542f]">{String(r.team_name ?? "—")}</span> : String(r.team_name ?? "—")) },
        { label: "Rang", render: (r) => (r.rank == null ? "—" : String(r.rank)) },
        { label: "Pts", render: (r) => String(r.points ?? "—") },
        { label: "Affiché", render: (r) => (r.is_active ? <span className="font-black text-emerald-700">✓</span> : <span className="text-slate-400">—</span>) }
      ]}
    />
  );
}
