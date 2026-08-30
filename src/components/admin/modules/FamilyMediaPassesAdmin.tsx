"use client";

import { Check, Loader2, Pencil, Plus, RefreshCw, RotateCcw, Save, Search, ShieldCheck, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { showToast } from "@/components/admin/Toast";

type Family = { id: string; name: string };
type Season = { id: string; name: string; starts_on: string; ends_on: string; is_active: boolean };
type Team = { id: string; name: string; season_id: string | null };
type PassStatus = "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "REJECTED" | "CANCELLED" | "EXPIRED";
type MediaPass = {
  id: string;
  family_id: string;
  family_name: string;
  season_id: string;
  season_name: string;
  status: PassStatus;
  starts_on: string;
  ends_on: string;
  allow_photos: boolean;
  allow_training_videos: boolean;
  allow_live_matches: boolean;
  review_note: string | null;
  reviewed_at: string | null;
  teams: Team[];
};

type PassForm = {
  id: string | null;
  familyId: string;
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
type BulkStatus = "ACTIVE" | "SUSPENDED" | "CANCELLED";
type BulkFeedback = { status: BulkStatus; succeeded: string[]; failed: Array<{ id: string; reason: string }> };

const STATUS: Array<{ value: PassStatus; label: string }> = [
  { value: "PENDING_REVIEW", label: "À valider" },
  { value: "ACTIVE", label: "Actif" },
  { value: "SUSPENDED", label: "Suspendu" },
  { value: "REJECTED", label: "Refusé" },
  { value: "CANCELLED", label: "Annulé" },
  { value: "EXPIRED", label: "Expiré" }
];

const INPUT = "focus-ring min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900";
const MAX_BULK_SELECTION = 100;

function emptyForm(seasons: Season[]): PassForm {
  const season = seasons.find((item) => item.is_active) ?? seasons[0];
  return {
    id: null,
    familyId: "",
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

function statusLabel(status: PassStatus): string {
  return STATUS.find((item) => item.value === status)?.label ?? status;
}

export function FamilyMediaPassesAdmin() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [passes, setPasses] = useState<MediaPass[]>([]);
  const [form, setForm] = useState<PassForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkStatus, setBulkStatus] = useState<BulkStatus>("ACTIVE");
  const [bulkFeedback, setBulkFeedback] = useState<BulkFeedback | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [passResponse, familyResponse, seasonResponse, teamResponse] = await Promise.all([
        fetch("/api/admin/family-media-passes?limit=1000", { credentials: "same-origin" }),
        fetch("/api/admin/families?limit=2000", { credentials: "same-origin" }),
        fetch("/api/admin/seasons?limit=200", { credentials: "same-origin" }),
        fetch("/api/admin/teams?limit=500", { credentials: "same-origin" })
      ]);
      const [passJson, familyJson, seasonJson, teamJson] = await Promise.all([
        passResponse.json().catch(() => null),
        familyResponse.json().catch(() => null),
        seasonResponse.json().catch(() => null),
        teamResponse.json().catch(() => null)
      ]);
      const failed = [passResponse, familyResponse, seasonResponse, teamResponse].find((response) => !response.ok);
      if (failed) throw new Error("Impossible de charger les Pass Famille Média.");
      const nextPasses = Array.isArray(passJson?.data?.passes) ? passJson.data.passes as MediaPass[] : [];
      setPasses(nextPasses);
      setSelectedIds((current) => new Set([...current].filter((id) => nextPasses.some((pass) => pass.id === id))));
      setFamilies(familyJson?.data?.families ?? []);
      setSeasons(seasonJson?.data?.seasons ?? []);
      setTeams(teamJson?.data?.teams ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const seasonTeams = useMemo(() => teams.filter((team) => team.season_id === form?.seasonId), [form?.seasonId, teams]);
  const annualAccessLabel = seasons.find((season) => season.is_active)?.name ?? "Saison active";
  const filteredPasses = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("fr");
    return passes.filter((pass) => {
      const matchesSearch = !needle ||
        pass.family_name.toLocaleLowerCase("fr").includes(needle) ||
        pass.teams.some((team) => team.name.toLocaleLowerCase("fr").includes(needle));
      return matchesSearch &&
        (!statusFilter || pass.status === statusFilter) &&
        (!seasonFilter || pass.season_id === seasonFilter) &&
        (!teamFilter || pass.teams.some((team) => team.id === teamFilter));
    });
  }, [passes, search, seasonFilter, statusFilter, teamFilter]);
  const allFilteredSelected = filteredPasses.length > 0 && filteredPasses.every((pass) => selectedIds.has(pass.id));
  const filtersActive = Boolean(search || statusFilter || seasonFilter || teamFilter);

  function chooseSeason(seasonId: string) {
    if (!form) return;
    const season = seasons.find((item) => item.id === seasonId);
    setForm({ ...form, seasonId, startsOn: season?.starts_on ?? "", endsOn: season?.ends_on ?? "", teamIds: [] });
  }

  function editPass(item: MediaPass) {
    setError("");
    setForm({
      id: item.id,
      familyId: item.family_id,
      seasonId: item.season_id,
      status: item.status,
      startsOn: item.starts_on,
      endsOn: item.ends_on,
      allowPhotos: item.allow_photos,
      allowTrainingVideos: item.allow_training_videos,
      allowLiveMatches: item.allow_live_matches,
      teamIds: item.teams.map((team) => team.id),
      reviewNote: item.review_note ?? ""
    });
  }

  function toggleTeam(teamId: string) {
    if (!form) return;
    setForm({ ...form, teamIds: form.teamIds.includes(teamId) ? form.teamIds.filter((id) => id !== teamId) : [...form.teamIds, teamId] });
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("");
    setSeasonFilter("");
    setTeamFilter("");
  }

  function togglePassSelection(passId: string) {
    setError("");
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(passId)) next.delete(passId);
      else if (next.size < MAX_BULK_SELECTION) next.add(passId);
      else setError(`Une action groupée est limitée à ${MAX_BULK_SELECTION} pass.`);
      return next;
    });
  }

  function toggleFilteredSelection() {
    setError("");
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allFilteredSelected) {
        filteredPasses.forEach((pass) => next.delete(pass.id));
        return next;
      }
      const missing = filteredPasses.filter((pass) => !next.has(pass.id));
      if (next.size + missing.length > MAX_BULK_SELECTION) {
        setError(`La sélection filtrée dépasse la limite de ${MAX_BULK_SELECTION} pass.`);
        return current;
      }
      missing.forEach((pass) => next.add(pass.id));
      return next;
    });
  }

  async function applyBulkStatus() {
    const ids = [...selectedIds];
    if (!ids.length || ids.length > MAX_BULK_SELECTION) return;
    if (!window.confirm(`Appliquer le statut « ${statusLabel(bulkStatus)} » aux ${ids.length} pass sélectionnés ?`)) return;

    setBulkSaving(true);
    setError("");
    setBulkFeedback(null);
    try {
      const response = await fetch("/api/admin/family-media-passes/bulk", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status: bulkStatus })
      });
      const json = await response.json().catch(() => null);
      if (!response.ok || !json?.ok || !json.data?.result) throw new Error(json?.error?.message || "Action groupée impossible.");
      const feedback = { status: bulkStatus, ...json.data.result } as BulkFeedback;
      const succeeded = new Set(feedback.succeeded);
      setPasses((current) => current.map((pass) => succeeded.has(pass.id) ? { ...pass, status: bulkStatus } : pass));
      setSelectedIds(new Set(feedback.failed.map((failure) => failure.id)));
      setBulkFeedback(feedback);
      showToast(`${feedback.succeeded.length} pass mis à jour.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erreur réseau.");
    } finally {
      setBulkSaving(false);
    }
  }

  async function save() {
    if (!form) return;
    if (!form.familyId || !form.seasonId || !form.startsOn || !form.endsOn || form.teamIds.length === 0) {
      setError("Famille, saison, dates et au moins une équipe sont obligatoires.");
      return;
    }
    if (!form.allowPhotos && !form.allowTrainingVideos && !form.allowLiveMatches) {
      setError("Activez au moins un droit.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(form.id ? `/api/admin/family-media-passes/${form.id}` : "/api/admin/family-media-passes", {
        method: form.id ? "PATCH" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId: form.familyId,
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

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-[#07542f]">Accès annuel · {annualAccessLabel}</p>
          <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Pass Famille Média</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">L’activation est manuelle après vérification de la famille et du règlement. Un pass actif ne donne accès qu’aux droits et équipes cochés.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void load()} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-black uppercase text-slate-700"><RefreshCw size={16} /> Actualiser</button>
          <button type="button" onClick={() => setForm(emptyForm(seasons))} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-[#002f1d] px-4 text-sm font-black uppercase text-white"><Plus size={17} /> Attribuer</button>
        </div>
      </div>

      {error ? <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}

      {form ? (
        <div className="mt-5 border-t border-slate-200 pt-5">
          <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-black uppercase text-[#002f1d]">{form.id ? "Modifier le pass" : "Nouveau pass"}</h3><button type="button" onClick={() => setForm(null)} aria-label="Fermer" className="focus-ring rounded-md p-2 text-slate-500"><X size={19} /></button></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-bold text-slate-800">Famille<select className={INPUT} value={form.familyId} onChange={(event) => setForm({ ...form, familyId: event.target.value })}><option value="">Choisir une famille</option>{families.map((family) => <option key={family.id} value={family.id}>{family.name}</option>)}</select></label>
            <label className="grid gap-1.5 text-sm font-bold text-slate-800">Saison<select className={INPUT} value={form.seasonId} onChange={(event) => chooseSeason(event.target.value)}><option value="">Choisir une saison</option>{seasons.map((season) => <option key={season.id} value={season.id}>{season.name}{season.is_active ? " · active" : ""}</option>)}</select></label>
            <label className="grid gap-1.5 text-sm font-bold text-slate-800">Début<input className={INPUT} type="date" value={form.startsOn} onChange={(event) => setForm({ ...form, startsOn: event.target.value })} /></label>
            <label className="grid gap-1.5 text-sm font-bold text-slate-800">Fin<input className={INPUT} type="date" value={form.endsOn} onChange={(event) => setForm({ ...form, endsOn: event.target.value })} /></label>
            <label className="grid gap-1.5 text-sm font-bold text-slate-800">Statut<select className={INPUT} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PassStatus })}>{STATUS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
            <label className="grid gap-1.5 text-sm font-bold text-slate-800 sm:col-span-2">Note interne<textarea className={`${INPUT} min-h-24 py-3`} value={form.reviewNote} onChange={(event) => setForm({ ...form, reviewNote: event.target.value })} placeholder="Sélection et règlement vérifiés…" /></label>
          </div>
          <fieldset className="mt-5"><legend className="text-sm font-black uppercase text-[#002f1d]">Droits accordés</legend><div className="mt-3 flex flex-wrap gap-3">{[["allowPhotos", "Photos complètes"], ["allowTrainingVideos", "Vidéos d’entraînement"], ["allowLiveMatches", "Matchs en direct"]].map(([key, label]) => <label key={key} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-bold"><input type="checkbox" checked={Boolean(form[key as keyof PassForm])} onChange={(event) => setForm({ ...form, [key]: event.target.checked })} className="h-5 w-5 accent-[#07542f]" /> {label}</label>)}</div></fieldset>
          <fieldset className="mt-5"><legend className="text-sm font-black uppercase text-[#002f1d]">Équipes autorisées</legend><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{seasonTeams.map((team) => <label key={team.id} className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm font-bold ${form.teamIds.includes(team.id) ? "border-[#07542f] bg-emerald-50 text-[#002f1d]" : "border-slate-200"}`}><input type="checkbox" checked={form.teamIds.includes(team.id)} onChange={() => toggleTeam(team.id)} className="h-5 w-5 accent-[#07542f]" /> {team.name}</label>)}</div>{form.seasonId && seasonTeams.length === 0 ? <p className="mt-2 text-sm font-semibold text-amber-700">Aucune équipe n’est rattachée à cette saison.</p> : null}</fieldset>
          <button type="button" disabled={saving} onClick={() => void save()} className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#f7c600] px-5 text-sm font-black uppercase text-[#002f1d] disabled:opacity-60">{saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Enregistrer</button>
        </div>
      ) : null}

      <div className="mt-6 border-t border-slate-200 pt-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="relative grid gap-1.5 text-sm font-bold text-slate-800 sm:col-span-2 xl:col-span-1">Recherche<span className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input className={`${INPUT} pl-10`} type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Famille ou équipe" /></span></label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-800">Statut<select className={INPUT} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Tous les statuts</option>{STATUS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-800">Saison<select className={INPUT} value={seasonFilter} onChange={(event) => setSeasonFilter(event.target.value)}><option value="">Toutes les saisons</option>{seasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}</select></label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-800">Équipe<select className={INPUT} value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)}><option value="">Toutes les équipes</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-black text-[#002f1d]">{filteredPasses.length} résultat{filteredPasses.length > 1 ? "s" : ""} sur {passes.length}</p>
          <div className="flex flex-wrap gap-2"><button className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-xs font-black uppercase text-slate-700 disabled:opacity-50" disabled={!filtersActive} type="button" onClick={clearFilters}><RotateCcw size={15} /> Réinitialiser</button><button className="focus-ring min-h-10 rounded-md border border-[#002f1d]/20 px-3 text-xs font-black uppercase text-[#002f1d] disabled:opacity-50" disabled={!filteredPasses.length} type="button" onClick={toggleFilteredSelection}>{allFilteredSelected ? "Désélectionner les résultats" : "Sélectionner les résultats"}</button></div>
        </div>
      </div>

      {selectedIds.size ? <div className="mt-4 flex flex-col gap-3 rounded-md border border-[#07542f]/25 bg-emerald-50 p-3 sm:flex-row sm:items-end"><div className="min-w-0 flex-1"><p className="text-sm font-black text-[#002f1d]">{selectedIds.size} pass sélectionné{selectedIds.size > 1 ? "s" : ""}</p><p className="mt-1 text-xs font-semibold text-slate-600">Maximum {MAX_BULK_SELECTION} par action. Seuls ces identifiants seront modifiés.</p></div><label className="grid gap-1 text-xs font-black uppercase text-slate-700">Nouveau statut<select className={`${INPUT} sm:w-48`} value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value as BulkStatus)}><option value="ACTIVE">Actif</option><option value="SUSPENDED">Suspendu</option><option value="CANCELLED">Annulé</option></select></label><button className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#002f1d] px-4 text-sm font-black uppercase text-white disabled:opacity-60" disabled={bulkSaving} type="button" onClick={() => void applyBulkStatus()}>{bulkSaving ? <Loader2 className="animate-spin" size={17} /> : <Check size={17} />} Appliquer</button><button className="focus-ring min-h-11 px-3 text-sm font-bold text-slate-600" type="button" onClick={() => setSelectedIds(new Set())}>Effacer</button></div> : null}

      {bulkFeedback ? <p className={`mt-4 rounded-md px-3 py-2 text-sm font-bold ${bulkFeedback.failed.length ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-900"}`} role="status">{bulkFeedback.succeeded.length} succès · {bulkFeedback.failed.length} échec{bulkFeedback.failed.length > 1 ? "s" : ""}{bulkFeedback.failed.length ? " (pass introuvables, non modifiés)" : ""}</p> : null}

      <div className="mt-5">
        {loading ? <p className="flex items-center gap-2 py-6 text-sm font-bold text-slate-500"><Loader2 className="animate-spin" size={18} /> Chargement…</p> : passes.length === 0 ? <p className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm font-bold text-slate-500">Aucun Pass Famille Média attribué.</p> : filteredPasses.length === 0 ? <p className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm font-bold text-slate-500">Aucun pass ne correspond aux filtres.</p> : (
          <>
            <div className="grid gap-3 lg:hidden">{filteredPasses.map((item) => <article className={`rounded-md border p-4 ${selectedIds.has(item.id) ? "border-[#07542f] bg-emerald-50" : "border-slate-200"}`} key={item.id}><div className="flex items-start gap-3"><input aria-label={`Sélectionner ${item.family_name}`} checked={selectedIds.has(item.id)} className="mt-1 h-5 w-5 shrink-0 accent-[#07542f]" type="checkbox" onChange={() => togglePassSelection(item.id)} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><h3 className="break-words font-black text-[#002f1d]">{item.family_name}</h3><p className="mt-1 text-sm font-semibold text-slate-600">{item.season_name}</p></div><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${item.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{item.status === "ACTIVE" ? <Check size={13} /> : <ShieldCheck size={13} />}{statusLabel(item.status)}</span></div><dl className="mt-3 grid gap-2 text-sm"><div><dt className="text-xs font-black uppercase text-slate-500">Équipes</dt><dd className="mt-1 break-words font-semibold text-slate-800">{item.teams.map((team) => team.name).join(", ")}</dd></div><div><dt className="text-xs font-black uppercase text-slate-500">Droits</dt><dd className="mt-1 font-semibold text-slate-800">{[item.allow_photos && "Photos", item.allow_training_videos && "Entraînements", item.allow_live_matches && "Directs"].filter(Boolean).join(" · ")}</dd></div><div><dt className="text-xs font-black uppercase text-slate-500">Validité</dt><dd className="mt-1 font-semibold text-slate-800">{item.starts_on} au {item.ends_on}</dd></div></dl><button aria-label={`Modifier ${item.family_name}`} className="focus-ring mt-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-[#002f1d]/20 px-3 text-xs font-black uppercase text-[#07542f]" type="button" onClick={() => editPass(item)}><Pencil size={16} /> Modifier</button></div></div></article>)}</div>
            <table className="hidden w-full border-separate border-spacing-0 text-left text-sm lg:table"><thead><tr className="text-xs font-black uppercase text-slate-500"><th className="w-12 border-b border-slate-200 px-3 py-3"><input aria-label="Sélectionner les résultats filtrés" checked={allFilteredSelected} className="h-5 w-5 accent-[#07542f]" type="checkbox" onChange={toggleFilteredSelection} /></th>{["Famille", "Saison", "Statut", "Droits", "Équipes", "Validité", ""].map((label) => <th key={label} className="border-b border-slate-200 px-3 py-3">{label}</th>)}</tr></thead><tbody>{filteredPasses.map((item) => <tr key={item.id} className={`align-top ${selectedIds.has(item.id) ? "bg-emerald-50" : ""}`}><td className="border-b border-slate-100 px-3 py-4"><input aria-label={`Sélectionner ${item.family_name}`} checked={selectedIds.has(item.id)} className="h-5 w-5 accent-[#07542f]" type="checkbox" onChange={() => togglePassSelection(item.id)} /></td><td className="border-b border-slate-100 px-3 py-4 font-black text-[#002f1d]">{item.family_name}</td><td className="border-b border-slate-100 px-3 py-4">{item.season_name}</td><td className="border-b border-slate-100 px-3 py-4"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${item.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{item.status === "ACTIVE" ? <Check size={13} /> : <ShieldCheck size={13} />}{statusLabel(item.status)}</span></td><td className="border-b border-slate-100 px-3 py-4 text-xs font-bold">{[item.allow_photos && "Photos", item.allow_training_videos && "Entraînements", item.allow_live_matches && "Directs"].filter(Boolean).join(" · ")}</td><td className="border-b border-slate-100 px-3 py-4 text-xs font-semibold">{item.teams.map((team) => team.name).join(", ")}</td><td className="border-b border-slate-100 px-3 py-4 text-xs font-semibold">{item.starts_on}<br />{item.ends_on}</td><td className="border-b border-slate-100 px-3 py-4"><button aria-label={`Modifier ${item.family_name}`} className="focus-ring rounded-md p-2 text-[#07542f] hover:bg-emerald-50" type="button" onClick={() => editPass(item)}><Pencil size={17} /></button></td></tr>)}</tbody></table>
          </>
        )}
      </div>
    </section>
  );
}
