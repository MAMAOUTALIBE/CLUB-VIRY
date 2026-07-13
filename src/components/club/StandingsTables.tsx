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

const HEAD = [
  { key: "rank", label: "#" },
  { key: "team", label: "Équipe" },
  { key: "played", label: "J" },
  { key: "won", label: "G" },
  { key: "drawn", label: "N" },
  { key: "lost", label: "P" },
  { key: "gf", label: "BP" },
  { key: "ga", label: "BC" },
  { key: "diff", label: "Diff" },
  { key: "points", label: "Pts" }
];

export function StandingsTables({ standings }: { standings: Standing[] }) {
  if (standings.length === 0) {
    return null;
  }

  const groups = groupByCompetition(standings);

  return (
    <div className="grid gap-8">
      {groups.map((group) => (
        <div className="official-card overflow-hidden rounded-lg bg-white" key={group.competition}>
          <h3 className="bg-[#002f1d] px-5 py-3 text-sm font-black uppercase text-[#f7c600]">{group.competition}</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-black uppercase text-slate-500">
                  {HEAD.map((head) => (
                    <th className={`px-3 py-2 ${head.key === "team" ? "" : "text-center"}`} key={head.key}>
                      {head.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr className={`border-b border-slate-100 ${row.is_own_club ? "bg-[#f7c600]/20" : ""}`} key={row.id}>
                    <td className="px-3 py-2.5 text-center font-black text-[#002f1d]">{row.rank ?? "—"}</td>
                    <td className={`px-3 py-2.5 font-bold ${row.is_own_club ? "text-[#07542f]" : "text-slate-800"}`}>{row.team_name}</td>
                    <td className="px-3 py-2.5 text-center text-slate-600">{row.played}</td>
                    <td className="px-3 py-2.5 text-center text-slate-600">{row.won}</td>
                    <td className="px-3 py-2.5 text-center text-slate-600">{row.drawn}</td>
                    <td className="px-3 py-2.5 text-center text-slate-600">{row.lost}</td>
                    <td className="px-3 py-2.5 text-center text-slate-600">{row.goals_for}</td>
                    <td className="px-3 py-2.5 text-center text-slate-600">{row.goals_against}</td>
                    <td className="px-3 py-2.5 text-center text-slate-600">{diffLabel(row.goals_for - row.goals_against)}</td>
                    <td className="px-3 py-2.5 text-center font-black text-[#002f1d]">{row.points}</td>
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
