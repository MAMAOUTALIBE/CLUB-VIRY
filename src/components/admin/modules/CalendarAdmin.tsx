"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from "@dnd-kit/core";
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GripVertical,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Trophy,
  UsersRound,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  detectPlanningConflicts,
  matchesPlanningFilters,
  movePlanningRange,
  planningDateKey,
  planningWeekDays,
  startOfPlanningWeek,
  type PlanningFilters,
  type PlanningKind
} from "@/lib/planning-kanban";

type TeamOption = { id: string; name: string };
type MatchRow = {
  id: string;
  team_id: string | null;
  opponent_name: string;
  opponent_logo_url: string | null;
  location: "HOME" | "AWAY" | "NEUTRAL";
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
  competition: string | null;
  status: "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED" | "CANCELLED";
  home_score: number | null;
  away_score: number | null;
  live_minute: number | null;
  follow_url: string | null;
  notes: string | null;
};
type EventRow = {
  id: string;
  team_id: string | null;
  title: string;
  type: "TRAINING" | "STAGE" | "MEETING" | "TOURNAMENT" | "CLUB_EVENT" | "DEADLINE" | "OTHER";
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
  description: string | null;
  visibility: "PUBLIC" | "MEMBERS" | "STAFF";
  status: "SCHEDULED" | "CANCELLED";
};
type PlanningItem = {
  key: string;
  id: string;
  source: "match" | "event";
  kind: PlanningKind;
  title: string;
  startsAt: string;
  endsAt: string | null;
  teamId: string | null;
  venue: string | null;
  cancelled: boolean;
  match?: MatchRow;
  event?: EventRow;
};
type EditorState = { mode: "create"; date: string } | { mode: "edit"; item: PlanningItem } | null;
type EditorForm = {
  kind: PlanningKind;
  title: string;
  opponentName: string;
  opponentLogoUrl: string;
  date: string;
  start: string;
  end: string;
  teamId: string;
  venue: string;
  description: string;
  competition: string;
  location: "HOME" | "AWAY" | "NEUTRAL";
  matchStatus: MatchRow["status"];
  homeScore: string;
  awayScore: string;
  liveMinute: string;
  followUrl: string;
};

const KIND_META: Record<PlanningKind, { label: string; badge: string; dot: string }> = {
  TRAINING: { label: "Entraînement", badge: "bg-amber-100 text-amber-800", dot: "bg-amber-400" },
  MATCH: { label: "Match", badge: "bg-rose-100 text-rose-800", dot: "bg-rose-500" },
  STAGE: { label: "Stage", badge: "bg-blue-100 text-blue-800", dot: "bg-blue-600" },
  EVENT: { label: "Événement", badge: "bg-violet-100 text-violet-800", dot: "bg-violet-500" }
};

const INPUT = "focus-ring min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400";

function eventKind(type: EventRow["type"]): PlanningKind {
  if (type === "TRAINING") return "TRAINING";
  if (type === "STAGE") return "STAGE";
  return "EVENT";
}

function localInputTime(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function toIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatWeekLabel(days: Date[]): string {
  const first = days[0];
  const last = days.at(-1)!;
  const month = new Intl.DateTimeFormat("fr-FR", { month: "long" });
  if (first.getMonth() === last.getMonth()) return `Semaine du ${first.getDate()} au ${last.getDate()} ${month.format(last)} ${last.getFullYear()}`;
  return `Semaine du ${first.getDate()} ${month.format(first)} au ${last.getDate()} ${month.format(last)} ${last.getFullYear()}`;
}

function itemFromMatch(row: MatchRow, teamName: string | null): PlanningItem {
  return {
    key: `match:${row.id}`,
    id: row.id,
    source: "match",
    kind: "MATCH",
    title: `${teamName ?? "Équipe non renseignée"} vs ${row.opponent_name}`,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    teamId: row.team_id,
    venue: row.venue,
    cancelled: row.status === "CANCELLED",
    match: row
  };
}

function itemFromEvent(row: EventRow): PlanningItem {
  return {
    key: `event:${row.id}`,
    id: row.id,
    source: "event",
    kind: eventKind(row.type),
    title: row.title,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    teamId: row.team_id,
    venue: row.venue,
    cancelled: row.status === "CANCELLED",
    event: row
  };
}

function formFromEditor(editor: NonNullable<EditorState>): EditorForm {
  if (editor.mode === "create") {
    return { kind: "TRAINING", title: "", opponentName: "", opponentLogoUrl: "", date: editor.date, start: "18:00", end: "19:30", teamId: "", venue: "", description: "", competition: "", location: "HOME", matchStatus: "SCHEDULED", homeScore: "", awayScore: "", liveMinute: "", followUrl: "" };
  }
  const item = editor.item;
  return {
    kind: item.kind,
    title: item.source === "event" ? item.title : "",
    opponentName: item.match?.opponent_name ?? "",
    opponentLogoUrl: item.match?.opponent_logo_url ?? "",
    date: planningDateKey(item.startsAt),
    start: localInputTime(item.startsAt),
    end: localInputTime(item.endsAt),
    teamId: item.teamId ?? "",
    venue: item.venue ?? "",
    description: item.event?.description ?? item.match?.notes ?? "",
    competition: item.match?.competition ?? "",
    location: item.match?.location ?? "HOME",
    matchStatus: item.match?.status ?? "SCHEDULED",
    homeScore: item.match?.home_score == null ? "" : String(item.match.home_score),
    awayScore: item.match?.away_score == null ? "" : String(item.match.away_score),
    liveMinute: item.match?.live_minute == null ? "" : String(item.match.live_minute),
    followUrl: item.match?.follow_url ?? ""
  };
}

function PlanningCardBody({ conflicts, item, teamName }: { conflicts: string[]; item: PlanningItem; teamName: string | null }) {
  const meta = KIND_META[item.kind];
  return (
    <>
      <div className="flex min-w-0 items-start gap-2">
        <span className={`rounded px-2 py-1 text-[10px] font-black uppercase ${meta.badge}`}>{meta.label}</span>
        {conflicts.length ? <span title={conflicts.join(" · ")} className="ml-auto text-red-600"><AlertTriangle size={16} aria-label="Conflit de planning" /></span> : null}
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600"><Clock3 size={14} aria-hidden /> {formatTime(item.startsAt)}{item.endsAt ? ` – ${formatTime(item.endsAt)}` : ""}</p>
      <h3 className="mt-2 text-sm font-black leading-snug text-slate-950">{item.title}</h3>
      {teamName ? <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-600"><UsersRound size={14} aria-hidden /> <span className="truncate">{teamName}</span></p> : null}
      {item.venue ? <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600"><MapPin size={14} aria-hidden /> <span className="truncate">{item.venue}</span></p> : null}
      {item.cancelled ? <p className="mt-2 text-[10px] font-black uppercase text-red-700">Annulé</p> : null}
    </>
  );
}

function PlanningCard({ conflicts, item, teamName, onEdit }: { conflicts: string[]; item: PlanningItem; teamName: string | null; onEdit: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.key });
  return (
    <article ref={setNodeRef} style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }} className={`relative rounded-md border bg-white p-3 shadow-sm transition ${conflicts.length ? "border-red-400 ring-1 ring-red-100" : "border-slate-200 hover:border-emerald-400"} ${isDragging ? "z-50 opacity-35" : ""} ${item.cancelled ? "opacity-60" : ""}`}>
      <div className="absolute right-2 top-2 flex items-center gap-1">
        <button type="button" onClick={onEdit} className="focus-ring rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-[#00351f]" aria-label={`Modifier ${item.title}`}><Pencil size={15} /></button>
        <button type="button" {...attributes} {...listeners} className="focus-ring touch-none cursor-grab rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-[#00351f] active:cursor-grabbing" aria-label={`Déplacer ${item.title}`}><GripVertical size={17} /></button>
      </div>
      <div className="pr-14"><PlanningCardBody conflicts={conflicts} item={item} teamName={teamName} /></div>
    </article>
  );
}

function DayColumn({ activeDrag, conflicts, date, items, teamNames, onAdd, onEdit }: { activeDrag: boolean; conflicts: Map<string, string[]>; date: Date; items: PlanningItem[]; teamNames: Map<string, string>; onAdd: () => void; onEdit: (item: PlanningItem) => void }) {
  const key = planningDateKey(date);
  const { isOver, setNodeRef } = useDroppable({ id: `day:${key}` });
  const dayLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(date);
  const today = key === planningDateKey(new Date());
  return (
    <section ref={setNodeRef} aria-label={`${dayLabel} ${date.getDate()}`} className={`flex min-h-[31rem] min-w-[250px] flex-1 flex-col rounded-md border bg-slate-50/80 transition ${isOver ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200" : today ? "border-[#f7c600]" : "border-slate-200"}`}>
      <header className="border-b border-slate-200 px-3 py-3">
        <div className="flex items-center justify-between gap-2"><div><p className="text-xs font-black uppercase text-[#00351f]">{dayLabel}</p><p className="mt-0.5 text-xs text-slate-500">{date.getDate()} {new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date)}</p></div>{today ? <span className="rounded-full bg-[#f7c600] px-2 py-1 text-[9px] font-black uppercase text-[#00351f]">Aujourd’hui</span> : null}</div>
        <button type="button" onClick={onAdd} className="focus-ring mt-2 inline-flex min-h-8 items-center gap-1 rounded px-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100"><Plus size={15} /> Ajouter</button>
      </header>
      <div className="flex flex-1 flex-col gap-2 p-2.5">
        {activeDrag ? <div className={`flex min-h-24 items-center justify-center rounded-md border border-dashed p-3 text-center text-xs font-bold transition ${isOver ? "border-emerald-600 bg-white text-emerald-900" : "border-slate-300 text-slate-500"}`}><span><CalendarDays className="mx-auto mb-2" size={22} aria-hidden />Déposer ici<br />pour planifier au {dayLabel} {date.getDate()}</span></div> : null}
        {items.length ? items.map((item) => <PlanningCard key={item.key} item={item} conflicts={conflicts.get(item.key) ?? []} teamName={item.teamId ? teamNames.get(item.teamId) ?? null : null} onEdit={() => onEdit(item)} />) : <p className="my-auto px-3 text-center text-xs font-semibold text-slate-400">Aucun élément planifié</p>}
      </div>
    </section>
  );
}

function EventEditor({ editor, saving, teams, venues, onClose, onDelete, onSave }: { editor: NonNullable<EditorState>; saving: boolean; teams: TeamOption[]; venues: string[]; onClose: () => void; onDelete: () => void; onSave: (form: EditorForm) => void }) {
  const [form, setForm] = useState(() => formFromEditor(editor));
  const isMatch = form.kind === "MATCH";
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape" && !saving) onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, saving]);
  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/35" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <aside role="dialog" aria-modal="true" aria-labelledby="planning-editor-title" className="ml-auto h-full w-full max-w-[430px] overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between gap-3"><h2 id="planning-editor-title" className="text-xl font-black text-[#002f1d]">{editor.mode === "edit" ? "Modifier l’événement" : "Nouvel événement"}</h2><button autoFocus type="button" disabled={saving} onClick={onClose} className="focus-ring rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Fermer"><X size={20} /></button></div>
        <form className="mt-6 grid gap-4" onSubmit={(event) => { event.preventDefault(); onSave(form); }}>
          <label className="grid gap-1.5 text-xs font-black text-slate-700">Type<select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as PlanningKind })} disabled={editor.mode === "edit"} className={INPUT}><option value="TRAINING">Entraînement</option><option value="MATCH">Match</option><option value="STAGE">Stage</option><option value="EVENT">Événement</option></select></label>
          {isMatch ? <label className="grid gap-1.5 text-xs font-black text-slate-700">Adversaire<input required value={form.opponentName} onChange={(event) => setForm({ ...form, opponentName: event.target.value })} className={INPUT} placeholder="Nom de l’adversaire" /></label> : <label className="grid gap-1.5 text-xs font-black text-slate-700">Titre<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={INPUT} placeholder="Nom de l’événement" /></label>}
          <label className="grid gap-1.5 text-xs font-black text-slate-700">Date<input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className={INPUT} /></label>
          <div className="grid grid-cols-2 gap-3"><label className="grid gap-1.5 text-xs font-black text-slate-700">Heure de début<input required type="time" value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} className={INPUT} /></label><label className="grid gap-1.5 text-xs font-black text-slate-700">Heure de fin<input type="time" value={form.end} onChange={(event) => setForm({ ...form, end: event.target.value })} className={INPUT} /></label></div>
          <label className="grid gap-1.5 text-xs font-black text-slate-700">Équipe<select name="teamId" required={isMatch} value={form.teamId} onChange={(event) => setForm({ ...form, teamId: event.target.value })} className={INPUT}><option value="">{isMatch ? "Choisir une équipe" : "Club / aucune équipe"}</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
          <label className="grid gap-1.5 text-xs font-black text-slate-700">Terrain ou lieu<input list="planning-venues" value={form.venue} onChange={(event) => setForm({ ...form, venue: event.target.value })} className={INPUT} placeholder="Terrain enregistré" /><datalist id="planning-venues">{venues.map((venue) => <option key={venue} value={venue} />)}</datalist></label>
          {isMatch ? <>
            <label className="grid gap-1.5 text-xs font-black text-slate-700">Logo de l’adversaire (URL)<input name="opponentLogoUrl" type="url" value={form.opponentLogoUrl} onChange={(event) => setForm({ ...form, opponentLogoUrl: event.target.value })} className={INPUT} placeholder="https://…" /></label>
            <label className="grid gap-1.5 text-xs font-black text-slate-700">Compétition<input value={form.competition} onChange={(event) => setForm({ ...form, competition: event.target.value })} className={INPUT} /></label>
            <label className="grid gap-1.5 text-xs font-black text-slate-700">Localisation<select value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value as EditorForm["location"] })} className={INPUT}><option value="HOME">Domicile</option><option value="AWAY">Extérieur</option><option value="NEUTRAL">Terrain neutre</option></select></label>
            <label className="grid gap-1.5 text-xs font-black text-slate-700">Statut<select value={form.matchStatus} onChange={(event) => setForm({ ...form, matchStatus: event.target.value as MatchRow["status"] })} className={INPUT}><option value="SCHEDULED">Programmé</option><option value="LIVE">En direct</option><option value="FINISHED">Terminé</option><option value="POSTPONED">Reporté</option><option value="CANCELLED">Annulé</option></select></label>
            {form.matchStatus === "LIVE" || form.matchStatus === "FINISHED" ? <div className="grid grid-cols-2 gap-3"><label className="grid gap-1.5 text-xs font-black text-slate-700">Score domicile<input min="0" max="99" type="number" value={form.homeScore} onChange={(event) => setForm({ ...form, homeScore: event.target.value })} className={INPUT} /></label><label className="grid gap-1.5 text-xs font-black text-slate-700">Score extérieur<input min="0" max="99" type="number" value={form.awayScore} onChange={(event) => setForm({ ...form, awayScore: event.target.value })} className={INPUT} /></label></div> : null}
            {form.matchStatus === "LIVE" ? <label className="grid gap-1.5 text-xs font-black text-slate-700">Minute du direct<input name="liveMinute" min="0" max="130" type="number" value={form.liveMinute} onChange={(event) => setForm({ ...form, liveMinute: event.target.value })} className={INPUT} /></label> : null}
            <label className="grid gap-1.5 text-xs font-black text-slate-700">Lien de suivi du direct<input name="followUrl" type="url" value={form.followUrl} onChange={(event) => setForm({ ...form, followUrl: event.target.value })} className={INPUT} placeholder="https://…" /></label>
          </> : null}
          <label className="grid gap-1.5 text-xs font-black text-slate-700">Description (optionnel)<textarea rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={`${INPUT} py-3`} placeholder="Ajouter des détails…" /></label>
          <div className="mt-3 flex items-center gap-2">{editor.mode === "edit" ? <button type="button" disabled={saving} onClick={onDelete} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-xs font-black uppercase text-red-700 hover:bg-red-50"><Trash2 size={17} /> Supprimer</button> : null}<button type="submit" disabled={saving} className="focus-ring ml-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#f7c600] px-5 text-xs font-black uppercase text-[#002f1d] hover:bg-[#ffd84d] disabled:opacity-60">{saving ? <Loader2 className="animate-spin" size={17} /> : <ShieldCheck size={17} />} Enregistrer</button></div>
        </form>
      </aside>
    </div>
  );
}

export function CalendarAdmin() {
  const [weekStart, setWeekStart] = useState(() => startOfPlanningWeek(new Date()));
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [filters, setFilters] = useState<PlanningFilters>({ kind: "ALL", teamId: "", venue: "" });
  const [editor, setEditor] = useState<EditorState>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [reload, setReload] = useState(0);
  const days = useMemo(() => planningWeekDays(weekStart), [weekStart]);
  const teamNames = useMemo(() => new Map(teams.map((team) => [team.id, team.name])), [teams]);
  const range = useMemo(() => ({ from: new Date(days[0].getFullYear(), days[0].getMonth(), days[0].getDate()).toISOString(), to: new Date(days.at(-1)!.getFullYear(), days.at(-1)!.getMonth(), days.at(-1)!.getDate(), 23, 59, 59, 999).toISOString() }), [days]);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setMessage(null);
    try {
      const params = new URLSearchParams({ limit: "2000", from: range.from, to: range.to });
      const [teamResponse, matchResponse, eventResponse] = await Promise.all([
        fetch("/api/admin/teams?limit=200", { credentials: "same-origin", signal }),
        fetch(`/api/admin/matches?${params}`, { credentials: "same-origin", signal }),
        fetch(`/api/admin/calendar/events?${params}`, { credentials: "same-origin", signal })
      ]);
      const [teamJson, matchJson, eventJson] = await Promise.all([teamResponse.json(), matchResponse.json(), eventResponse.json()]);
      if (!teamResponse.ok || !teamJson?.ok || !matchResponse.ok || !matchJson?.ok || !eventResponse.ok || !eventJson?.ok) throw new Error("Le planning n’a pas pu être chargé.");
      setTeams((teamJson.data?.teams ?? []).map((team: TeamOption) => ({ id: team.id, name: team.name })));
      setMatches(matchJson.data?.matches ?? []); setEvents(eventJson.data?.events ?? []);
    } catch (cause) {
      if ((cause as Error).name !== "AbortError") setMessage({ tone: "error", text: cause instanceof Error ? cause.message : "Erreur réseau." });
    } finally { setLoading(false); }
  }, [range.from, range.to]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void load(controller.signal), 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [load, reload]);

  const items = useMemo(() => [...matches.map((row) => itemFromMatch(row, row.team_id ? teamNames.get(row.team_id) ?? null : null)), ...events.map(itemFromEvent)].sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt)), [events, matches, teamNames]);
  const conflicts = useMemo(() => detectPlanningConflicts(items.map((item) => ({ id: item.key, startsAt: item.startsAt, endsAt: item.endsAt, teamId: item.teamId, venue: item.venue, cancelled: item.cancelled }))), [items]);
  const visibleItems = useMemo(() => items.filter((item) => matchesPlanningFilters(item, filters)), [filters, items]);
  const venues = useMemo(() => [...new Set(items.map((item) => item.venue?.trim()).filter((venue): venue is string => Boolean(venue)))].sort((left, right) => left.localeCompare(right, "fr")), [items]);
  const activeItem = activeKey ? items.find((item) => item.key === activeKey) ?? null : null;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }));

  async function request(url: string, method: "POST" | "PATCH" | "DELETE", body?: Record<string, unknown>) {
    const response = await fetch(url, { method, credentials: "same-origin", headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    const json = await response.json().catch(() => null);
    if (!response.ok || !json?.ok) throw new Error(json?.error?.details?.[0]?.message ?? json?.error?.message ?? "Enregistrement impossible.");
    return json.data;
  }

  async function saveEditor(form: EditorForm) {
    if (!editor) return;
    const startsAt = toIso(form.date, form.start);
    const endsAt = form.end ? toIso(form.date, form.end) : null;
    if (endsAt && Date.parse(endsAt) < Date.parse(startsAt)) { setMessage({ tone: "error", text: "L’heure de fin doit être après l’heure de début." }); return; }
    setSaving(true); setMessage(null);
    try {
      if (form.kind === "MATCH") {
        const payload = { teamId: form.teamId || null, opponentName: form.opponentName, opponentLogoUrl: form.opponentLogoUrl || undefined, startsAt, endsAt, venue: form.venue || null, competition: form.competition || null, location: form.location, notes: form.description || null, status: form.matchStatus, homeScore: form.homeScore === "" ? undefined : Number(form.homeScore), awayScore: form.awayScore === "" ? undefined : Number(form.awayScore), liveMinute: form.liveMinute === "" ? null : Number(form.liveMinute), followUrl: form.followUrl || null };
        await request(editor.mode === "edit" ? `/api/admin/matches/${editor.item.id}` : "/api/admin/matches", editor.mode === "edit" ? "PATCH" : "POST", payload);
      } else {
        const existing = editor.mode === "edit" ? editor.item.event : null;
        const eventType = form.kind === "TRAINING" ? "TRAINING" : form.kind === "STAGE" ? "STAGE" : existing && !["TRAINING", "STAGE"].includes(existing.type) ? existing.type : "CLUB_EVENT";
        const payload = { teamId: form.teamId || null, title: form.title, type: eventType, startsAt, endsAt, venue: form.venue || null, description: form.description || null, visibility: existing?.visibility ?? "PUBLIC", status: existing?.status ?? "SCHEDULED" };
        await request(editor.mode === "edit" ? `/api/admin/calendar/events/${editor.item.id}` : "/api/admin/calendar/events", editor.mode === "edit" ? "PATCH" : "POST", payload);
      }
      setEditor(null); setMessage({ tone: "success", text: editor.mode === "edit" ? "Événement mis à jour." : "Événement ajouté au planning." }); setReload((value) => value + 1);
    } catch (cause) { setMessage({ tone: "error", text: cause instanceof Error ? cause.message : "Erreur réseau." }); }
    finally { setSaving(false); }
  }

  async function deleteEditor() {
    if (!editor || editor.mode !== "edit" || !window.confirm(`Supprimer « ${editor.item.title} » du planning ?`)) return;
    setSaving(true); setMessage(null);
    try { await request(editor.item.source === "match" ? `/api/admin/matches/${editor.item.id}` : `/api/admin/calendar/events/${editor.item.id}`, "DELETE"); setEditor(null); setMessage({ tone: "success", text: "Élément placé dans la corbeille." }); setReload((value) => value + 1); }
    catch (cause) { setMessage({ tone: "error", text: cause instanceof Error ? cause.message : "Suppression impossible." }); }
    finally { setSaving(false); }
  }

  function onDragStart(event: DragStartEvent) { setActiveKey(String(event.active.id)); }
  async function onDragEnd(event: DragEndEvent) {
    setActiveKey(null);
    const item = items.find((candidate) => candidate.key === String(event.active.id));
    const target = String(event.over?.id ?? "").match(/^day:(\d{4}-\d{2}-\d{2})$/)?.[1];
    if (!item || !target || planningDateKey(item.startsAt) === target) return;
    const moved = movePlanningRange(item.startsAt, item.endsAt, target);
    const previousMatches = matches; const previousEvents = events;
    if (item.source === "match") setMatches((rows) => rows.map((row) => row.id === item.id ? { ...row, starts_at: moved.startsAt, ends_at: moved.endsAt } : row));
    else setEvents((rows) => rows.map((row) => row.id === item.id ? { ...row, starts_at: moved.startsAt, ends_at: moved.endsAt } : row));
    try {
      await request(item.source === "match" ? `/api/admin/matches/${item.id}` : `/api/admin/calendar/events/${item.id}`, "PATCH", { startsAt: moved.startsAt, endsAt: moved.endsAt });
      setMessage({ tone: "success", text: `Déplacé au ${new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${target}T12:00:00`))}.` });
    } catch (cause) {
      setMatches(previousMatches); setEvents(previousEvents);
      setMessage({ tone: "error", text: `${cause instanceof Error ? cause.message : "Déplacement impossible."} La date précédente a été restaurée.` });
    }
  }

  const stats = { trainings: items.filter((item) => item.kind === "TRAINING").length, matches: items.filter((item) => item.kind === "MATCH").length, events: items.filter((item) => item.kind === "STAGE" || item.kind === "EVENT").length, conflicts: conflicts.size };

  return (
    <div className="min-w-0">
      <header className="flex flex-wrap items-start gap-4"><div className="mr-auto"><h1 className="text-2xl font-black text-[#002f1d] sm:text-3xl">Planning & événements</h1><p className="mt-1 text-sm font-semibold text-emerald-800">{formatWeekLabel(days)}</p></div><button type="button" onClick={() => setEditor({ mode: "create", date: planningDateKey(new Date()) })} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-[#f7c600] px-4 text-xs font-black uppercase text-[#002f1d] shadow-sm hover:bg-[#ffd84d]"><Plus size={18} /> Créer un événement</button></header>
      <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-md border border-slate-200 bg-white sm:grid-cols-4">
        {[{ label: "entraînements", value: stats.trainings, icon: CalendarDays, color: "text-amber-600 bg-amber-50" }, { label: "matchs", value: stats.matches, icon: Trophy, color: "text-rose-600 bg-rose-50" }, { label: "stages & événements", value: stats.events, icon: UsersRound, color: "text-violet-600 bg-violet-50" }, { label: "conflits", value: stats.conflicts, icon: AlertTriangle, color: stats.conflicts ? "text-red-600 bg-red-50" : "text-emerald-700 bg-emerald-50" }].map(({ label, value, icon: Icon, color }) => <div key={label} className="flex min-h-20 items-center gap-3 border-b border-r border-slate-200 p-3 last:border-r-0 sm:border-b-0"><span className={`flex size-10 shrink-0 items-center justify-center rounded-md ${color}`}><Icon size={21} /></span><span><strong className="block text-xl font-black text-slate-950">{value}</strong><span className="text-xs font-semibold text-slate-600">{label}</span></span></div>)}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setWeekStart(startOfPlanningWeek(new Date()))} className="focus-ring min-h-10 rounded-md border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">Aujourd’hui</button>
        <button type="button" onClick={() => setWeekStart((current) => { const next = new Date(current); next.setDate(next.getDate() - 7); return next; })} className="focus-ring flex size-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700" aria-label="Semaine précédente"><ChevronLeft size={18} /></button>
        <button type="button" onClick={() => setWeekStart((current) => { const next = new Date(current); next.setDate(next.getDate() + 7); return next; })} className="focus-ring flex size-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700" aria-label="Semaine suivante"><ChevronRight size={18} /></button>
        <button type="button" onClick={() => setReload((value) => value + 1)} className="focus-ring flex size-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700" aria-label="Actualiser le planning"><RefreshCw size={17} /></button>
        <div className="ml-auto flex w-full flex-wrap gap-2 lg:w-auto">
          <select aria-label="Filtrer par type" value={filters.kind} onChange={(event) => setFilters({ ...filters, kind: event.target.value as PlanningFilters["kind"] })} className={`${INPUT} w-full sm:w-auto`}><option value="ALL">Tous les types</option>{Object.entries(KIND_META).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}</select>
          <select aria-label="Filtrer par équipe" value={filters.teamId} onChange={(event) => setFilters({ ...filters, teamId: event.target.value })} className={`${INPUT} w-full sm:w-auto`}><option value="">Toutes les équipes</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select>
          <select aria-label="Filtrer par terrain" value={filters.venue} onChange={(event) => setFilters({ ...filters, venue: event.target.value })} className={`${INPUT} w-full sm:w-auto`}><option value="">Tous les terrains</option>{venues.map((venue) => <option key={venue} value={venue}>{venue}</option>)}</select>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-600">{Object.entries(KIND_META).map(([kind, meta]) => <span key={kind} className="inline-flex items-center gap-2"><span className={`size-2.5 rounded-full ${meta.dot}`} />{meta.label}</span>)}</div>
      {message ? <p role="status" className={`mt-4 rounded-md border px-4 py-3 text-sm font-bold ${message.tone === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{message.text}</p> : null}
      {stats.conflicts ? <p className="mt-3 inline-flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs font-bold text-red-800"><AlertTriangle size={16} /> Conflit de planning détecté sur {stats.conflicts} carte{stats.conflicts > 1 ? "s" : ""}.</p> : null}
      <div className="mt-5 overflow-x-auto pb-3 [scrollbar-color:#0b6b46_#e2e8f0]">
        {loading ? <div className="flex min-h-80 items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-bold text-slate-600"><Loader2 className="mr-2 animate-spin" size={20} /> Chargement du planning…</div> : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragCancel={() => setActiveKey(null)} onDragEnd={(event) => void onDragEnd(event)}>
            <div className="flex min-w-[1120px] gap-3">{days.map((date) => <DayColumn key={planningDateKey(date)} date={date} items={visibleItems.filter((item) => planningDateKey(item.startsAt) === planningDateKey(date))} conflicts={conflicts} activeDrag={Boolean(activeKey)} teamNames={teamNames} onAdd={() => setEditor({ mode: "create", date: planningDateKey(date) })} onEdit={(item) => setEditor({ mode: "edit", item })} />)}</div>
            <DragOverlay>{activeItem ? <div className="w-[240px] rotate-2 rounded-md border border-[#f7c600] bg-white p-3 shadow-2xl"><PlanningCardBody item={activeItem} conflicts={conflicts.get(activeItem.key) ?? []} teamName={activeItem.teamId ? teamNames.get(activeItem.teamId) ?? null : null} /></div> : null}</DragOverlay>
          </DndContext>
        )}
      </div>
      {editor ? <EventEditor key={editor.mode === "edit" ? editor.item.key : editor.date} editor={editor} saving={saving} teams={teams} venues={venues} onClose={() => setEditor(null)} onDelete={() => void deleteEditor()} onSave={(form) => void saveEditor(form)} /> : null}
    </div>
  );
}
