"use client";

import { AlertTriangle, CheckCircle2, Image as ImageIcon, Loader2, Pencil, Plus, RefreshCw, Save, ShieldCheck, Users, Video, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { showToast } from "@/components/admin/Toast";

type PassStatus = "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "REJECTED" | "CANCELLED" | "EXPIRED";
type Season = { id: string; name: string; starts_on: string; ends_on: string; is_active: boolean };
type Team = { id: string; name: string; season_id: string | null };
type Account = { profileId: string; email: string | null; firstName: string | null; lastName: string | null; displayName: string | null; status: string };
type MediaPass = {
  id: string;
  season_id: string;
  season_name: string;
  status: PassStatus;
  starts_on: string;
  ends_on: string;
  allow_photos: boolean;
  allow_training_videos: boolean;
  allow_live_matches: boolean;
  review_note: string | null;
  teams: Team[];
};
type Resource = {
  id: string;
  team_id: string | null;
  team_name: string | null;
  type: "PHOTO" | "VIDEO";
  content_kind: "MATCH" | "TRAINING" | null;
  playback_kind: "VIDEO" | "BROADCAST_LINK";
  title: string | null;
  is_live: boolean;
  published_at: string | null;
};
type Summary = {
  family: { id: string; name: string };
  accounts: Account[];
  currentPass: MediaPass | null;
  seasons: Season[];
  teams: Team[];
  resources: Resource[];
  resourcesTruncated: boolean;
  anomalies: Array<{ code: string; label: string }>;
};
type PassForm = {
  id: string | null;
  seasonId: string;
  status: PassStatus;
  startsOn: string;
  endsOn: string;
  allowPhotos: boolean;
  allowTrainingVideos: boolean;
  allowLiveMatches: boolean;
  teamIds: string[];
  reviewNote: string;
};

const STATUS: Array<{ value: PassStatus; label: string }> = [
  { value: "PENDING_REVIEW", label: "À valider" },
  { value: "ACTIVE", label: "Actif" },
  { value: "SUSPENDED", label: "Suspendu" },
  { value: "REJECTED", label: "Refusé" },
  { value: "CANCELLED", label: "Annulé" },
  { value: "EXPIRED", label: "Expiré" }
];
const INPUT = "focus-ring min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900";

function statusLabel(status: PassStatus): string {
  return STATUS.find((item) => item.value === status)?.label ?? status;
}

function newPassForm(seasons: Season[]): PassForm {
  const season = seasons.find((item) => item.is_active) ?? seasons[0];
  return {
    id: null,
    seasonId: season?.id ?? "",
    status: "PENDING_REVIEW",
    startsOn: season?.starts_on ?? "",
    endsOn: season?.ends_on ?? "",
    allowPhotos: true,
    allowTrainingVideos: true,
    allowLiveMatches: true,
    teamIds: [],
    reviewNote: ""
  };
}

function editPassForm(pass: MediaPass): PassForm {
  return {
    id: pass.id,
    seasonId: pass.season_id,
    status: pass.status,
    startsOn: pass.starts_on,
    endsOn: pass.ends_on,
    allowPhotos: pass.allow_photos,
    allowTrainingVideos: pass.allow_training_videos,
    allowLiveMatches: pass.allow_live_matches,
    teamIds: pass.teams.map((team) => team.id),
    reviewNote: pass.review_note ?? ""
  };
}

function accountName(account: Account): string {
  return [account.firstName, account.lastName].filter(Boolean).join(" ") || account.displayName || account.email || "Compte sans nom";
}

export function FamilyOperationsCenter({ familyId }: { familyId: string }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "forbidden" | "error">("loading");
  const [error, setError] = useState("");
  const [form, setForm] = useState<PassForm | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const response = await fetch(`/api/admin/families/${familyId}/operations`, { credentials: "same-origin" });
      const json = await response.json().catch(() => null);
      if (response.status === 403) return setStatus("forbidden");
      if (!response.ok || !json?.ok || !json.data?.summary) throw new Error(json?.error?.message || "Synthèse famille indisponible.");
      setSummary(json.data.summary);
      setStatus("ready");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erreur réseau.");
      setStatus("error");
    }
  }, [familyId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const seasonTeams = useMemo(
    () => summary?.teams.filter((team) => team.season_id === form?.seasonId) ?? [],
    [form?.seasonId, summary?.teams]
  );

  function chooseSeason(seasonId: string) {
    if (!form || !summary) return;
    const season = summary.seasons.find((item) => item.id === seasonId);
    setForm({ ...form, seasonId, startsOn: season?.starts_on ?? "", endsOn: season?.ends_on ?? "", teamIds: [] });
  }

  function toggleTeam(teamId: string) {
    if (!form) return;
    setForm({ ...form, teamIds: form.teamIds.includes(teamId) ? form.teamIds.filter((id) => id !== teamId) : [...form.teamIds, teamId] });
  }

  async function savePass() {
    if (!form || !summary) return;
    if (!form.seasonId || !form.startsOn || !form.endsOn || form.teamIds.length === 0) return setError("Saison, dates et au moins une équipe sont obligatoires.");
    if (!form.allowPhotos && !form.allowTrainingVideos && !form.allowLiveMatches) return setError("Activez au moins un droit.");

    setSaving(true);
    setError("");
    try {
      const response = await fetch(form.id ? `/api/admin/family-media-passes/${form.id}` : "/api/admin/family-media-passes", {
        method: form.id ? "PATCH" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId,
          seasonId: form.seasonId,
          status: form.status,
          startsOn: form.startsOn,
          endsOn: form.endsOn,
          allowPhotos: form.allowPhotos,
          allowTrainingVideos: form.allowTrainingVideos,
          allowLiveMatches: form.allowLiveMatches,
          teamIds: form.teamIds,
          reviewNote: form.reviewNote || null
        })
      });
      const json = await response.json().catch(() => null);
      if (!response.ok || !json?.ok) {
        const details = Array.isArray(json?.error?.details) ? json.error.details.map((item: { message?: string }) => item.message).filter(Boolean).join(" · ") : "";
        throw new Error(details || json?.error?.message || "Enregistrement impossible.");
      }
      showToast(form.id ? "Pass mis à jour." : "Pass créé.");
      setForm(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erreur réseau.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "forbidden") return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-labelledby="family-operations-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-[#07542f]">Vue opérationnelle</p>
          <h2 className="mt-1 break-words text-xl font-black uppercase text-[#002f1d] sm:text-2xl" id="family-operations-title">Pilotage famille</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Compte, habilitations et contenus réellement accessibles depuis un seul écran.</p>
        </div>
        <button className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-black uppercase text-slate-700" type="button" onClick={() => void load()}><RefreshCw size={16} /> Actualiser</button>
      </div>

      {status === "loading" ? <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-600"><Loader2 className="animate-spin" size={18} /> Chargement du pilotage…</p> : null}
      {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700" role="alert">{error}</p> : null}

      {status === "ready" && summary ? (
        <>
          <div className="mt-5 grid gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Comptes famille", value: String(summary.accounts.length), icon: Users },
              { label: "Pass courant", value: summary.currentPass ? statusLabel(summary.currentPass.status) : "Absent", icon: ShieldCheck },
              { label: "Équipes autorisées", value: String(summary.currentPass?.teams.length ?? 0), icon: CheckCircle2 },
              { label: "Ressources accessibles", value: `${summary.resources.length}${summary.resourcesTruncated ? "+" : ""}`, icon: ImageIcon }
            ].map((item) => <div className="min-w-0 bg-white p-4" key={item.label}><item.icon className="text-[#07542f]" size={19} /><p className="mt-3 text-xs font-black uppercase text-slate-500">{item.label}</p><p className="mt-1 break-words text-xl font-black text-[#002f1d]">{item.value}</p></div>)}
          </div>

          <div className={`mt-5 rounded-md border p-4 ${summary.anomalies.length ? "border-amber-300 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
            <h3 className="flex items-center gap-2 text-sm font-black uppercase text-[#002f1d]">{summary.anomalies.length ? <AlertTriangle className="text-amber-700" size={18} /> : <CheckCircle2 className="text-emerald-700" size={18} />}{summary.anomalies.length ? "Anomalies à traiter" : "Configuration opérationnelle"}</h3>
            {summary.anomalies.length ? <ul className="mt-3 grid gap-2 sm:grid-cols-2">{summary.anomalies.map((anomaly) => <li className="text-sm font-bold text-amber-950" key={anomaly.code}>{anomaly.label}</li>)}</ul> : <p className="mt-2 text-sm font-semibold text-emerald-900">Le compte et le pass donnent accès à des ressources publiées.</p>}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="min-w-0 border-t border-slate-200 pt-4">
              <h3 className="text-sm font-black uppercase text-[#002f1d]">Compte famille</h3>
              <div className="mt-3 grid gap-2">{summary.accounts.length ? summary.accounts.map((account) => <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b border-slate-100 py-2" key={account.profileId}><div className="min-w-0"><p className="break-words text-sm font-black text-slate-900">{accountName(account)}</p><p className="break-all text-xs font-semibold text-slate-500">{account.email ?? "Email absent"}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-black uppercase ${account.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{account.status}</span></div>) : <p className="text-sm font-semibold text-slate-500">Aucun compte rattaché.</p>}</div>
            </div>

            <div className="min-w-0 border-t border-slate-200 pt-4">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-black uppercase text-[#002f1d]">Pass Famille Média courant</h3>{summary.currentPass ? <p className="mt-1 text-sm font-semibold text-slate-600">{summary.currentPass.season_name} · {summary.currentPass.starts_on} au {summary.currentPass.ends_on}</p> : <p className="mt-1 text-sm font-semibold text-slate-500">Aucun pass pour la saison active.</p>}</div><button className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md bg-[#002f1d] px-3 text-xs font-black uppercase text-white" type="button" onClick={() => setForm(summary.currentPass ? editPassForm(summary.currentPass) : newPassForm(summary.seasons))}>{summary.currentPass ? <Pencil size={15} /> : <Plus size={15} />}{summary.currentPass ? "Modifier" : "Créer le pass"}</button></div>
              {summary.currentPass ? <div className="mt-4 grid gap-3"><p className="text-sm font-bold text-slate-700">Droits : {[summary.currentPass.allow_photos && "Photos", summary.currentPass.allow_training_videos && "Entraînements", summary.currentPass.allow_live_matches && "Directs"].filter(Boolean).join(" · ") || "Aucun"}</p><p className="text-sm font-bold text-slate-700">Équipes : {summary.currentPass.teams.map((team) => team.name).join(", ") || "Aucune"}</p></div> : null}
            </div>
          </div>

          {form ? (
            <div className="mt-6 border-t border-slate-200 pt-5">
              <div className="flex items-center justify-between gap-3"><div><h3 className="text-lg font-black uppercase text-[#002f1d]">{form.id ? "Modifier le pass" : "Créer le pass"}</h3><p className="mt-1 text-sm font-bold text-slate-600">Famille : {summary.family.name}</p></div><button aria-label="Fermer" className="focus-ring rounded-md p-2 text-slate-500" type="button" onClick={() => setForm(null)}><X size={19} /></button></div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-bold text-slate-800">Saison<select className={INPUT} value={form.seasonId} onChange={(event) => chooseSeason(event.target.value)}><option value="">Choisir une saison</option>{summary.seasons.map((season) => <option key={season.id} value={season.id}>{season.name}{season.is_active ? " · active" : ""}</option>)}</select></label>
                <label className="grid gap-1.5 text-sm font-bold text-slate-800">Statut<select className={INPUT} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PassStatus })}>{STATUS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
                <label className="grid gap-1.5 text-sm font-bold text-slate-800">Début<input className={INPUT} type="date" value={form.startsOn} onChange={(event) => setForm({ ...form, startsOn: event.target.value })} /></label>
                <label className="grid gap-1.5 text-sm font-bold text-slate-800">Fin<input className={INPUT} type="date" value={form.endsOn} onChange={(event) => setForm({ ...form, endsOn: event.target.value })} /></label>
                <label className="grid gap-1.5 text-sm font-bold text-slate-800 sm:col-span-2">Note interne<textarea className={`${INPUT} min-h-24 py-3`} value={form.reviewNote} onChange={(event) => setForm({ ...form, reviewNote: event.target.value })} /></label>
              </div>
              <fieldset className="mt-5"><legend className="text-sm font-black uppercase text-[#002f1d]">Droits accordés</legend><div className="mt-3 grid gap-2 sm:grid-cols-3">{[["allowPhotos", "Photos complètes"], ["allowTrainingVideos", "Vidéos d’entraînement"], ["allowLiveMatches", "Matchs en direct"]].map(([key, label]) => <label className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-bold" key={key}><input checked={Boolean(form[key as keyof PassForm])} className="h-5 w-5 accent-[#07542f]" type="checkbox" onChange={(event) => setForm({ ...form, [key]: event.target.checked })} />{label}</label>)}</div></fieldset>
              <fieldset className="mt-5"><legend className="text-sm font-black uppercase text-[#002f1d]">Équipes autorisées</legend><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{seasonTeams.map((team) => <label className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm font-bold ${form.teamIds.includes(team.id) ? "border-[#07542f] bg-emerald-50" : "border-slate-200"}`} key={team.id}><input checked={form.teamIds.includes(team.id)} className="h-5 w-5 accent-[#07542f]" type="checkbox" onChange={() => toggleTeam(team.id)} />{team.name}</label>)}</div>{form.seasonId && !seasonTeams.length ? <p className="mt-2 text-sm font-bold text-amber-700">Aucune équipe rattachée à cette saison.</p> : null}</fieldset>
              <button className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#f7c600] px-5 text-sm font-black uppercase text-[#002f1d] disabled:opacity-60" disabled={saving} type="button" onClick={() => void savePass()}>{saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Enregistrer</button>
            </div>
          ) : null}

          <div className="mt-6 border-t border-slate-200 pt-4">
            <h3 className="text-sm font-black uppercase text-[#002f1d]">Ressources publiées accessibles</h3>
            {summary.resources.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{summary.resources.slice(0, 12).map((resource) => <article className="min-w-0 rounded-md border border-slate-200 p-3" key={resource.id}><div className="flex items-center gap-2 text-[#07542f]">{resource.type === "PHOTO" ? <ImageIcon size={17} /> : <Video size={17} />}<span className="text-xs font-black uppercase">{resource.type === "PHOTO" ? "Photo" : resource.is_live ? "Direct" : "Vidéo"}</span></div><p className="mt-2 break-words text-sm font-black text-slate-900">{resource.title || "Sans titre"}</p><p className="mt-1 break-words text-xs font-semibold text-slate-500">{resource.team_name ?? "Équipe indisponible"}</p></article>)}</div> : <p className="mt-3 text-sm font-semibold text-slate-500">Aucune ressource publiée n’est actuellement accessible avec ce pass.</p>}
          </div>
        </>
      ) : null}
    </section>
  );
}
