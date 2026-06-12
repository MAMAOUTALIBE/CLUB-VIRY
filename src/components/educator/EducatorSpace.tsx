"use client";

import { CalendarDays, Crown, Loader2, Plus, Save, ShieldAlert, Users, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminAccessControl } from "@/components/admin/AdminAccessControl";

type TeamLite = { id: string; name: string; slug: string; age_range: string | null; level: string | null };
type StaffRow = { id: string; display_name: string; role_title: string; is_head_coach: boolean };
type PlayerLite = { id: string; first_name: string; last_name: string };
type Assignment = { team_id: string; player_id: string; position: string | null; shirt_number: number | null };
type RosterEntry = { assignment: Assignment; player: PlayerLite | null };
type MatchRow = {
  id: string;
  opponent_name: string | null;
  starts_at: string | null;
  location: "HOME" | "AWAY" | "NEUTRAL" | null;
  status: string | null;
  home_score: number | null;
  away_score: number | null;
  competition: string | null;
};
type Roster = { team: TeamLite; staff: StaffRow[]; matches: MatchRow[]; players: RosterEntry[] };

const EMPTY_MATCH = { opponentName: "", startsAt: "", location: "HOME", competition: "" };

function fmtDate(iso: string | null): string {
  if (!iso) return "Date à confirmer";
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

// Score "nous" / "adverse" <-> home/away selon le lieu du match.
function ourScore(m: MatchRow): number | null {
  return m.location === "AWAY" ? m.away_score : m.home_score;
}
function theirScore(m: MatchRow): number | null {
  return m.location === "AWAY" ? m.home_score : m.away_score;
}

export function EducatorSpace() {
  const [phase, setPhase] = useState<"loading" | "auth" | "forbidden" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [teams, setTeams] = useState<TeamLite[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [roster, setRoster] = useState<Roster | null>(null);
  const [rosterLoading, setRosterLoading] = useState(false);

  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [newMatch, setNewMatch] = useState(EMPTY_MATCH);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [scoreFor, setScoreFor] = useState<string | null>(null);
  const [score, setScore] = useState({ us: "", them: "" });

  const loadTeams = useCallback(async () => {
    setPhase("loading");
    setMessage("");
    try {
      const res = await fetch("/api/educator/teams", { credentials: "same-origin" });
      if (res.status === 401) {
        setPhase("auth");
        return;
      }
      if (res.status === 403) {
        setPhase("forbidden");
        return;
      }
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setPhase("error");
        setMessage(json?.error?.message ?? "Chargement impossible.");
        return;
      }
      // listTeamsForEducator renvoie des TeamDetail { team, staff, matches }
      const list: TeamLite[] = (Array.isArray(json.data?.teams) ? json.data.teams : []).map((d: { team: TeamLite }) => d.team).filter(Boolean);
      setTeams(list);
      setSelectedId((prev) => prev || (list[0]?.id ?? ""));
      setPhase("ready");
    } catch (e) {
      setPhase("error");
      setMessage(e instanceof Error ? e.message : "Erreur réseau.");
    }
  }, []);

  const loadRoster = useCallback(async (teamId: string) => {
    if (!teamId) {
      setRoster(null);
      return;
    }
    setRosterLoading(true);
    setFormError("");
    try {
      const res = await fetch(`/api/educator/teams/${teamId}/players`, { credentials: "same-origin" });
      if (res.status === 401) {
        setPhase("auth");
        return;
      }
      if (res.status === 403) {
        setPhase("forbidden");
        return;
      }
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setFormError(json?.error?.message ?? "Effectif indisponible.");
        setRoster(null);
        return;
      }
      setRoster(json.data as Roster);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erreur réseau.");
    } finally {
      setRosterLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void loadTeams(), 0);
    return () => window.clearTimeout(t);
  }, [loadTeams]);

  useEffect(() => {
    if (phase !== "ready" || !selectedId) {
      return;
    }
    const t = window.setTimeout(() => void loadRoster(selectedId), 0);
    return () => window.clearTimeout(t);
  }, [phase, selectedId, loadRoster]);

  async function createMatch() {
    if (!newMatch.opponentName.trim() || !newMatch.startsAt) {
      setFormError("Adversaire et date du match sont obligatoires.");
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      const res = await fetch("/api/educator/matches", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedId,
          opponentName: newMatch.opponentName.trim(),
          startsAt: newMatch.startsAt,
          location: newMatch.location,
          ...(newMatch.competition.trim() ? { competition: newMatch.competition.trim() } : {})
        })
      });
      if (res.status === 401) {
        setPhase("auth");
        return;
      }
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setFormError(json?.error?.message ?? "Création du match impossible.");
        return;
      }
      setNewMatch(EMPTY_MATCH);
      setShowMatchForm(false);
      await loadRoster(selectedId);
    } finally {
      setBusy(false);
    }
  }

  async function saveScore(m: MatchRow) {
    const us = score.us.trim() === "" ? null : Number(score.us);
    const them = score.them.trim() === "" ? null : Number(score.them);
    if (us === null || them === null || !Number.isInteger(us) || !Number.isInteger(them) || us < 0 || them < 0) {
      setFormError("Scores invalides (entiers positifs).");
      return;
    }
    const home = m.location === "AWAY" ? them : us;
    const away = m.location === "AWAY" ? us : them;
    setBusy(true);
    setFormError("");
    try {
      const res = await fetch(`/api/educator/matches/${m.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeScore: home, awayScore: away, status: "FINISHED" })
      });
      if (res.status === 401) {
        setPhase("auth");
        return;
      }
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setFormError(json?.error?.message ?? "Enregistrement du score impossible.");
        return;
      }
      setScoreFor(null);
      setScore({ us: "", them: "" });
      await loadRoster(selectedId);
    } finally {
      setBusy(false);
    }
  }

  if (phase === "loading") {
    return <p className="flex items-center gap-2 py-10 text-sm font-bold text-slate-500"><Loader2 className="animate-spin" size={18} /> Chargement de votre espace…</p>;
  }

  if (phase === "auth") {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black uppercase text-[#002f1d]">Connexion éducateur</h2>
        <p className="mt-1 mb-4 text-sm text-slate-600">Connectez-vous avec votre compte pour accéder à vos équipes.</p>
        <AdminAccessControl loading={false} onAuthenticated={() => void loadTeams()} />
      </div>
    );
  }

  if (phase === "forbidden") {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
        <ShieldAlert className="mx-auto text-amber-600" size={36} aria-hidden="true" />
        <h2 className="mt-3 text-xl font-black uppercase text-amber-900">Accès réservé aux éducateurs</h2>
        <p className="mt-2 text-sm font-semibold text-amber-800">Votre compte n'a pas le rôle Éducateur ou n'est rattaché à aucune équipe. Contactez la direction sportive du club.</p>
      </div>
    );
  }

  if (phase === "error") {
    return <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{message}</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Mes équipes */}
      <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:self-start">
        <p className="text-xs font-black uppercase text-[#07542f]">Mes équipes</p>
        {teams.length === 0 ? (
          <p className="mt-3 text-sm font-semibold text-slate-500">Aucune équipe ne vous est rattachée. Contactez la direction sportive.</p>
        ) : (
          <nav className="mt-3 grid gap-2">
            {teams.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                aria-current={t.id === selectedId ? "true" : undefined}
                className={`focus-ring flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-bold transition ${t.id === selectedId ? "bg-[#002f1d] text-white" : "text-[#002f1d] hover:bg-[#f4f6f1]"}`}
                type="button"
              >
                <Users size={16} aria-hidden="true" /> {t.name}
              </button>
            ))}
          </nav>
        )}
      </aside>

      {/* Détail équipe */}
      <div className="grid gap-6">
        {formError ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{formError}</p> : null}
        {rosterLoading ? <p className="flex items-center gap-2 text-sm font-bold text-slate-500"><Loader2 className="animate-spin" size={18} /> Chargement de l'équipe…</p> : null}

        {roster ? (
          <>
            <div>
              <p className="text-xs font-black uppercase text-[#07542f]">Catégorie {roster.team.age_range ?? roster.team.level ?? ""}</p>
              <h2 className="text-2xl font-black uppercase text-[#002f1d]">{roster.team.name}</h2>
            </div>

            {/* Calendrier / Matchs */}
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="inline-flex items-center gap-2 text-lg font-black uppercase text-[#002f1d]"><CalendarDays size={18} /> Matchs ({roster.matches.length})</h3>
                <button onClick={() => { setShowMatchForm((v) => !v); setFormError(""); }} className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-md bg-[#002f1d] px-4 text-xs font-black uppercase text-white hover:bg-[#07542f]" type="button"><Plus size={16} /> Nouveau match</button>
              </div>

              {showMatchForm ? (
                <div className="mt-4 grid gap-3 rounded-md border border-dashed border-[#002f1d]/20 p-3 sm:grid-cols-2">
                  <input value={newMatch.opponentName} onChange={(e) => setNewMatch((f) => ({ ...f, opponentName: e.target.value }))} placeholder="Adversaire" className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold" />
                  <input type="datetime-local" value={newMatch.startsAt} onChange={(e) => setNewMatch((f) => ({ ...f, startsAt: e.target.value }))} className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold" />
                  <select value={newMatch.location} onChange={(e) => setNewMatch((f) => ({ ...f, location: e.target.value }))} className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold">
                    <option value="HOME">Domicile</option>
                    <option value="AWAY">Extérieur</option>
                    <option value="NEUTRAL">Terrain neutre</option>
                  </select>
                  <input value={newMatch.competition} onChange={(e) => setNewMatch((f) => ({ ...f, competition: e.target.value }))} placeholder="Compétition (optionnel)" className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold" />
                  <div className="sm:col-span-2">
                    <button onClick={() => void createMatch()} disabled={busy} className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-md bg-[#f7c600] px-5 text-sm font-black uppercase text-[#002f1d] hover:bg-[#002f1d] hover:text-white disabled:opacity-70" type="button"><Save size={16} /> Créer le match</button>
                  </div>
                </div>
              ) : null}

              <ul className="mt-4 grid gap-2">
                {roster.matches.length === 0 ? <li className="rounded-md border border-dashed border-slate-300 bg-[#fbfcf8] p-4 text-sm font-bold text-slate-500">Aucun match programmé.</li> : null}
                {roster.matches.map((m) => (
                  <li key={m.id} className="rounded-md border border-slate-100 bg-[#fbfcf8] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-black text-[#002f1d]">{m.location === "AWAY" ? "à" : "vs"} {m.opponent_name ?? "Adversaire"}</span>
                        <span className="ml-2 text-xs font-semibold text-slate-500">{fmtDate(m.starts_at)}{m.competition ? ` · ${m.competition}` : ""}</span>
                      </div>
                      {ourScore(m) !== null && theirScore(m) !== null ? (
                        <span className="rounded-full bg-[#002f1d] px-3 py-1 text-xs font-black text-[#f7c600]">{ourScore(m)} – {theirScore(m)}</span>
                      ) : (
                        <button onClick={() => { setScoreFor(scoreFor === m.id ? null : m.id); setScore({ us: "", them: "" }); setFormError(""); }} className="focus-ring rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-black uppercase text-[#002f1d] hover:border-[#f7c600]" type="button">Saisir le résultat</button>
                      )}
                    </div>
                    {scoreFor === m.id ? (
                      <div className="mt-3 flex flex-wrap items-end gap-3">
                        <label className="grid gap-1 text-xs font-black uppercase text-slate-600">Notre score<input type="number" min={0} value={score.us} onChange={(e) => setScore((s) => ({ ...s, us: e.target.value }))} className="focus-ring min-h-11 w-24 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold" /></label>
                        <span className="pb-2 font-black text-slate-400">–</span>
                        <label className="grid gap-1 text-xs font-black uppercase text-slate-600">Adversaire<input type="number" min={0} value={score.them} onChange={(e) => setScore((s) => ({ ...s, them: e.target.value }))} className="focus-ring min-h-11 w-24 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold" /></label>
                        <button onClick={() => void saveScore(m)} disabled={busy} className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-md bg-[#f7c600] px-4 text-xs font-black uppercase text-[#002f1d] hover:bg-[#002f1d] hover:text-white disabled:opacity-70" type="button"><Save size={14} /> Enregistrer</button>
                        <button onClick={() => setScoreFor(null)} className="focus-ring inline-flex min-h-11 items-center rounded-md border border-slate-300 px-2 text-slate-600" type="button" aria-label="Annuler"><X size={16} /></button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>

            {/* Effectif */}
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="inline-flex items-center gap-2 text-lg font-black uppercase text-[#002f1d]"><Users size={18} /> Effectif ({roster.players.length})</h3>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {roster.players.length === 0 ? <li className="rounded-md border border-dashed border-slate-300 bg-[#fbfcf8] p-4 text-sm font-bold text-slate-500">Aucun joueur. La direction sportive gère l'effectif depuis le CRM.</li> : null}
                {roster.players.map((p) => (
                  <li key={p.assignment.player_id} className="flex items-center gap-3 rounded-md border border-slate-100 bg-[#fbfcf8] p-3">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#002f1d] px-2 text-xs font-black text-[#f7c600]">{p.assignment.shirt_number ?? "—"}</span>
                    <span className="font-black text-[#002f1d]">{p.player ? `${p.player.first_name} ${p.player.last_name}` : "Joueur"}</span>
                    {p.assignment.position ? <span className="text-sm text-slate-600">— {p.assignment.position}</span> : null}
                  </li>
                ))}
              </ul>
            </section>

            {/* Staff */}
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-black uppercase text-[#002f1d]">Encadrement</h3>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {roster.staff.length === 0 ? <li className="rounded-md border border-dashed border-slate-300 bg-[#fbfcf8] p-4 text-sm font-bold text-slate-500">Aucun staff renseigné.</li> : null}
                {roster.staff.map((s) => (
                  <li key={s.id} className="flex items-center gap-2 rounded-md border border-slate-100 bg-[#fbfcf8] p-3">
                    {s.is_head_coach ? <Crown size={15} className="text-[#f7c600]" aria-label="Coach principal" /> : null}
                    <span className="font-black text-[#002f1d]">{s.display_name}</span>
                    <span className="text-sm text-slate-600">— {s.role_title}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
