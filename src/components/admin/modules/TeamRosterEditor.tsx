"use client";

import { ArrowLeft, Crown, Loader2, Plus, Save, Trash2, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminAccessControl } from "@/components/admin/AdminAccessControl";

type StaffRow = { id: string; display_name: string; role_title: string; is_head_coach: boolean };
type PlayerLite = { id: string; first_name: string; last_name: string };
type Assignment = { team_id: string; player_id: string; position: string | null; shirt_number: number | null };
type RosterEntry = { assignment: Assignment; player: PlayerLite | null };

const EMPTY_STAFF = { displayName: "", roleTitle: "", isHeadCoach: false };
const EMPTY_PLAYER = { playerId: "", position: "", shirtNumber: "" };

export function TeamRosterEditor({ teamId }: { teamId: string }) {
  const [state, setState] = useState<"loading" | "ready" | "auth" | "error">("loading");
  const [message, setMessage] = useState("");
  const [teamName, setTeamName] = useState("");
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [allPlayers, setAllPlayers] = useState<PlayerLite[]>([]);

  // Formulaires
  const [newStaff, setNewStaff] = useState(EMPTY_STAFF);
  const [editStaffId, setEditStaffId] = useState<string | null>(null);
  const [editStaff, setEditStaff] = useState(EMPTY_STAFF);
  const [newPlayer, setNewPlayer] = useState(EMPTY_PLAYER);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    setMessage("");
    try {
      const [playersRes, staffRes, allRes] = await Promise.all([
        fetch(`/api/admin/teams/${teamId}/players`, { credentials: "same-origin" }),
        fetch(`/api/admin/teams/${teamId}/staff`, { credentials: "same-origin" }),
        fetch(`/api/admin/players?limit=500`, { credentials: "same-origin" })
      ]);
      if ([playersRes.status, staffRes.status, allRes.status].includes(401)) {
        setState("auth");
        return;
      }
      const [playersJson, staffJson, allJson] = await Promise.all([playersRes.json(), staffRes.json(), allRes.json()]);
      if (!playersJson?.ok || !staffJson?.ok || !allJson?.ok) {
        setState("error");
        setMessage(playersJson?.error?.message ?? staffJson?.error?.message ?? allJson?.error?.message ?? "Chargement impossible.");
        return;
      }
      setTeamName(playersJson.data?.team?.name ?? "");
      setRoster(Array.isArray(playersJson.data?.players) ? playersJson.data.players : []);
      setStaff(Array.isArray(staffJson.data?.staff) ? staffJson.data.staff : []);
      setAllPlayers(Array.isArray(allJson.data?.players) ? allJson.data.players : []);
      setState("ready");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Erreur réseau.");
    }
  }, [teamId]);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(t);
  }, [load]);

  async function call(url: string, method: string, body?: unknown): Promise<boolean> {
    setBusy(true);
    setFormError("");
    try {
      const res = await fetch(url, {
        method,
        credentials: "same-origin",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });
      if (res.status === 401) {
        setState("auth");
        return false;
      }
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        const details = Array.isArray(json?.error?.details) ? json.error.details.map((d: { field?: string; message?: string }) => `${d.field}: ${d.message}`).join(" · ") : "";
        setFormError(`${json?.error?.message ?? "Échec de l'opération."}${details ? " — " + details : ""}`);
        return false;
      }
      return true;
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Erreur réseau.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  // --- Staff ---
  async function addStaff() {
    if (!newStaff.displayName.trim() || !newStaff.roleTitle.trim()) {
      setFormError("Nom et rôle du staff sont obligatoires.");
      return;
    }
    const ok = await call(`/api/admin/teams/${teamId}/staff`, "POST", {
      displayName: newStaff.displayName.trim(),
      roleTitle: newStaff.roleTitle.trim(),
      isHeadCoach: newStaff.isHeadCoach
    });
    if (ok) {
      setNewStaff(EMPTY_STAFF);
      await load();
    }
  }

  function startEditStaff(s: StaffRow) {
    setEditStaffId(s.id);
    setEditStaff({ displayName: s.display_name, roleTitle: s.role_title, isHeadCoach: s.is_head_coach });
    setFormError("");
  }

  async function saveStaff(staffId: string) {
    if (!editStaff.displayName.trim() || !editStaff.roleTitle.trim()) {
      setFormError("Nom et rôle du staff sont obligatoires.");
      return;
    }
    const ok = await call(`/api/admin/teams/${teamId}/staff/${staffId}`, "PATCH", {
      displayName: editStaff.displayName.trim(),
      roleTitle: editStaff.roleTitle.trim(),
      isHeadCoach: editStaff.isHeadCoach
    });
    if (ok) {
      setEditStaffId(null);
      await load();
    }
  }

  async function deleteStaff(staffId: string) {
    const ok = await call(`/api/admin/teams/${teamId}/staff/${staffId}`, "DELETE");
    if (ok) await load();
  }

  // --- Joueurs ---
  const assignedIds = new Set(roster.map((r) => r.assignment.player_id));
  const availablePlayers = allPlayers.filter((p) => !assignedIds.has(p.id));

  async function addPlayer() {
    if (!newPlayer.playerId) {
      setFormError("Choisissez un joueur à affecter.");
      return;
    }
    const shirt = newPlayer.shirtNumber.trim() ? Number(newPlayer.shirtNumber) : undefined;
    if (shirt !== undefined && (!Number.isInteger(shirt) || shirt < 1 || shirt > 99)) {
      setFormError("Numéro de maillot invalide (1 à 99).");
      return;
    }
    const ok = await call(`/api/admin/teams/${teamId}/players`, "POST", {
      playerId: newPlayer.playerId,
      ...(newPlayer.position.trim() ? { position: newPlayer.position.trim() } : {}),
      ...(shirt !== undefined ? { shirtNumber: shirt } : {})
    });
    if (ok) {
      setNewPlayer(EMPTY_PLAYER);
      await load();
    }
  }

  async function removePlayer(playerId: string) {
    const ok = await call(`/api/admin/teams/${teamId}/players/${playerId}`, "DELETE");
    if (ok) await load();
  }

  if (state === "auth") {
    return (
      <div className="grid gap-6">
        <Back />
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="mb-3 text-sm font-bold text-amber-900">Session expirée — reconnectez-vous.</p>
          <AdminAccessControl loading={false} onAuthenticated={() => void load()} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <Back />
        <p className="mt-3 text-xs font-black uppercase text-[#07542f]">Effectif & encadrement</p>
        <h1 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">{teamName || "Équipe"}</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">Gérez le staff (entraîneurs, dirigeants) et l'effectif (joueurs, postes, numéros) de cette équipe. Ces informations alimentent la fiche publique de l'équipe.</p>
      </div>

      {state === "loading" ? (
        <p className="flex items-center gap-2 text-sm font-bold text-slate-500"><Loader2 className="animate-spin" size={18} /> Chargement…</p>
      ) : null}
      {message ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{message}</p> : null}

      {state === "ready" ? (
        <>
          {formError ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{formError}</p> : null}

          {/* STAFF */}
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black uppercase text-[#002f1d]">Staff ({staff.length})</h2>
            <ul className="mt-4 grid gap-2">
              {staff.length === 0 ? <li className="rounded-md border border-dashed border-slate-300 bg-[#fbfcf8] p-4 text-sm font-bold text-slate-500">Aucun membre du staff.</li> : null}
              {staff.map((s) =>
                editStaffId === s.id ? (
                  <li key={s.id} className="grid gap-3 rounded-md border border-[#002f1d]/15 bg-[#fbfcf8] p-3 sm:grid-cols-[1fr_1fr_auto_auto]">
                    <input value={editStaff.displayName} onChange={(e) => setEditStaff((f) => ({ ...f, displayName: e.target.value }))} placeholder="Nom" className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold" />
                    <input value={editStaff.roleTitle} onChange={(e) => setEditStaff((f) => ({ ...f, roleTitle: e.target.value }))} placeholder="Rôle" className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold" />
                    <label className="inline-flex items-center gap-2 text-xs font-black uppercase text-slate-700"><input type="checkbox" checked={editStaff.isHeadCoach} onChange={(e) => setEditStaff((f) => ({ ...f, isHeadCoach: e.target.checked }))} /> Coach principal</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => void saveStaff(s.id)} disabled={busy} className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-md bg-[#f7c600] px-3 text-xs font-black uppercase text-[#002f1d] hover:bg-[#002f1d] hover:text-white disabled:opacity-70" type="button"><Save size={14} /> OK</button>
                      <button onClick={() => setEditStaffId(null)} className="focus-ring inline-flex min-h-11 items-center rounded-md border border-slate-300 px-2 text-slate-600" type="button" aria-label="Annuler"><X size={16} /></button>
                    </div>
                  </li>
                ) : (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-100 bg-[#fbfcf8] p-3">
                    <div className="flex items-center gap-2">
                      {s.is_head_coach ? <Crown size={16} className="text-[#f7c600]" aria-label="Coach principal" /> : null}
                      <span className="font-black text-[#002f1d]">{s.display_name}</span>
                      <span className="text-sm text-slate-600">— {s.role_title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEditStaff(s)} className="focus-ring rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-black uppercase text-[#002f1d] hover:border-[#f7c600]" type="button">Éditer</button>
                      <button onClick={() => void deleteStaff(s.id)} disabled={busy} className="focus-ring inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-black uppercase text-red-700 hover:bg-red-50 disabled:opacity-70" type="button"><Trash2 size={13} /> Retirer</button>
                    </div>
                  </li>
                )
              )}
            </ul>
            {/* Ajout staff */}
            <div className="mt-4 grid gap-3 rounded-md border border-dashed border-[#002f1d]/20 p-3 sm:grid-cols-[1fr_1fr_auto_auto]">
              <input value={newStaff.displayName} onChange={(e) => setNewStaff((f) => ({ ...f, displayName: e.target.value }))} placeholder="Nom (ex: Yanis B.)" className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold" />
              <input value={newStaff.roleTitle} onChange={(e) => setNewStaff((f) => ({ ...f, roleTitle: e.target.value }))} placeholder="Rôle (ex: Entraîneur)" className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold" />
              <label className="inline-flex items-center gap-2 text-xs font-black uppercase text-slate-700"><input type="checkbox" checked={newStaff.isHeadCoach} onChange={(e) => setNewStaff((f) => ({ ...f, isHeadCoach: e.target.checked }))} /> Coach principal</label>
              <button onClick={() => void addStaff()} disabled={busy} className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-md bg-[#002f1d] px-4 text-xs font-black uppercase text-white hover:bg-[#07542f] disabled:opacity-70" type="button"><Plus size={16} /> Ajouter</button>
            </div>
          </section>

          {/* EFFECTIF */}
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black uppercase text-[#002f1d]">Effectif ({roster.length})</h2>
            <ul className="mt-4 grid gap-2">
              {roster.length === 0 ? <li className="rounded-md border border-dashed border-slate-300 bg-[#fbfcf8] p-4 text-sm font-bold text-slate-500">Aucun joueur affecté.</li> : null}
              {roster.map((r) => (
                <li key={r.assignment.player_id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-100 bg-[#fbfcf8] p-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#002f1d] px-2 text-xs font-black text-[#f7c600]">{r.assignment.shirt_number ?? "—"}</span>
                    <span className="font-black text-[#002f1d]">{r.player ? `${r.player.first_name} ${r.player.last_name}` : "Joueur inconnu"}</span>
                    {r.assignment.position ? <span className="text-sm text-slate-600">— {r.assignment.position}</span> : null}
                  </div>
                  <button onClick={() => void removePlayer(r.assignment.player_id)} disabled={busy} className="focus-ring inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-black uppercase text-red-700 hover:bg-red-50 disabled:opacity-70" type="button"><Trash2 size={13} /> Retirer</button>
                </li>
              ))}
            </ul>
            {/* Ajout joueur */}
            <div className="mt-4 grid gap-3 rounded-md border border-dashed border-[#002f1d]/20 p-3 sm:grid-cols-[2fr_1fr_auto_auto]">
              <select value={newPlayer.playerId} onChange={(e) => setNewPlayer((f) => ({ ...f, playerId: e.target.value }))} className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold">
                <option value="">— Choisir un joueur —</option>
                {availablePlayers.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
              </select>
              <input value={newPlayer.position} onChange={(e) => setNewPlayer((f) => ({ ...f, position: e.target.value }))} placeholder="Poste (ex: Défenseur)" className="focus-ring min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold" />
              <input value={newPlayer.shirtNumber} onChange={(e) => setNewPlayer((f) => ({ ...f, shirtNumber: e.target.value }))} placeholder="N°" inputMode="numeric" className="focus-ring min-h-11 w-20 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold" />
              <button onClick={() => void addPlayer()} disabled={busy || availablePlayers.length === 0} className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-md bg-[#002f1d] px-4 text-xs font-black uppercase text-white hover:bg-[#07542f] disabled:opacity-70" type="button"><UserPlus size={16} /> Affecter</button>
            </div>
            {availablePlayers.length === 0 && allPlayers.length > 0 ? <p className="mt-2 text-xs font-medium text-slate-500">Tous les joueurs enregistrés sont déjà affectés à cette équipe.</p> : null}
            {allPlayers.length === 0 ? <p className="mt-2 text-xs font-medium text-slate-500">Aucun joueur dans la base. Les joueurs proviennent des inscriptions / familles.</p> : null}
          </section>
        </>
      ) : null}
    </div>
  );
}

function Back() {
  return (
    <Link href="/admin/equipes" className="focus-ring inline-flex items-center gap-1.5 text-sm font-black uppercase text-[#07542f] hover:text-[#002f1d]">
      <ArrowLeft size={16} aria-hidden="true" /> Retour aux équipes
    </Link>
  );
}
