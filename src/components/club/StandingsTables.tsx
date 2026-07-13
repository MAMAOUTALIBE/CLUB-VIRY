import type { Standing } from "@/lib/db/types";

function groupByCompetition(rows: Standing[]): { competition: string; rows: Standing[] }[] {
  const groups: { competition: string; rows: Standing[] }[] = [];
  for (const row of rows) {
    const existing = groups.find((group) => group.competition === row.competition);
    if (existing) {
      existing.rows.push(row);
    } else {
      groups.push({ competition: row.competition, rows: [row] });
    }
  }
  return groups;
}

function diffLabel(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

// Colonnes révélées progressivement selon la largeur : #/Équipe/Pts toujours visibles ;
// J/G/N/P à partir de sm (tablette) ; BP/BC/Diff à partir de lg (desktop). Pas de
// défilement horizontal sur mobile — le tableau reste lisible sur tous les écrans.
const STAT_COLUMNS: { key: keyof Standing; label: string; reveal: string; render?: (row: Standing) => string }[] = [
  { key: "played", label: "J", reveal: "hidden sm:table-cell" },
  { key: "won", label: "G", reveal: "hidden sm:table-cell" },
  { key: "drawn", label: "N", reveal: "hidden sm:table-cell" },
  { key: "lost", label: "P", reveal: "hidden sm:table-cell" },
  { key: "goals_for", label: "BP", reveal: "hidden lg:table-cell" },
  { key: "goals_against", label: "BC", reveal: "hidden lg:table-cell" },
  { key: "goals_for", label: "Diff", reveal: "hidden lg:table-cell", render: (row) => diffLabel(row.goals_for - row.goals_against) }
];

export function StandingsTables({ standings }: { standings: Standing[] }) {
  if (standings.length === 0) {
    return null;
  }

  const groups = groupByCompetition(standings);

  return (
    <div className="grid gap-6">
      {groups.map((group) => (
        <div className="official-card overflow-hidden rounded-lg bg-white" key={group.competition}>
          <h3 className="bg-[#002f1d] px-4 py-3 text-sm font-black uppercase text-[#f7c600]">{group.competition}</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-[11px] font-black uppercase text-slate-500 sm:text-xs">
                  <th className="px-2 py-2 text-center sm:px-3">#</th>
                  <th className="px-2 py-2 sm:px-3">Équipe</th>
                  {STAT_COLUMNS.map((column) => (
                    <th className={`px-2 py-2 text-center sm:px-3 ${column.reveal}`} key={column.label}>
                      {column.label}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center sm:px-3">Pts</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr className={`border-b border-slate-100 ${row.is_own_club ? "bg-[#f7c600]/20" : ""}`} key={row.id}>
                    <td className="px-2 py-2.5 text-center font-black text-[#002f1d] sm:px-3">{row.rank ?? "—"}</td>
                    <td className={`px-2 py-2.5 font-bold sm:px-3 ${row.is_own_club ? "text-[#07542f]" : "text-slate-800"}`}>{row.team_name}</td>
                    {STAT_COLUMNS.map((column) => (
                      <td className={`px-2 py-2.5 text-center text-slate-600 sm:px-3 ${column.reveal}`} key={column.label}>
                        {column.render ? column.render(row) : String(row[column.key])}
                      </td>
                    ))}
                    <td className="px-2 py-2.5 text-center font-black text-[#002f1d] sm:px-3">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
