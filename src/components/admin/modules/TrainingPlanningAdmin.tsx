"use client";

import {
  DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter,
  useDroppable, useSensor, useSensors, type DragEndEvent
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, Clock3, GripVertical, Loader2, Lock, MapPin, Pencil, Plus, Redo2, Save, Trash2, Undo2, Unlock, UsersRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import { trainingSchedule as fallbackSchedule, type TrainingRow, type TrainingSlot } from "@/lib/home-sports-data";

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const pitches: TrainingSlot["pitch"][] = ["T1", "T2", "T3", "T4"];
const pitchColors = { T1: "bg-[#9b5a17]", T2: "bg-[#d93670]", T3: "bg-[#e85e32]", T4: "bg-[#7040a8]" };
type Board = TrainingRow[];
type Position = { row: number; day: number; index: number };
type ModalState = { mode: "create" | "edit"; row: number; day: number; index?: number } | null;

function clone(board: Board): Board { return structuredClone(board); }
function normalize(board: TrainingRow[]): Board {
  return clone(board).map((row) => ({ ...row, days: row.days.map((slots) => slots.map((slot) => ({ ...slot, id: slot.id || crypto.randomUUID() }))) }));
}
function findSlot(board: Board, id: string): Position | null {
  for (let row = 0; row < board.length; row += 1) for (let day = 0; day < 5; day += 1) {
    const index = board[row].days[day].findIndex((slot) => slot.id === id);
    if (index >= 0) return { row, day, index };
  }
  return null;
}

function SortableTrainingCard({ slot, locked, onEdit }: { slot: TrainingSlot; locked: boolean; onEdit: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slot.id!, disabled: locked });
  return <article ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`group rounded-lg border border-[#f5c400]/20 bg-white/[.055] p-2 text-left text-[10px] transition ${isDragging ? "z-50 scale-105 cursor-grabbing opacity-70 shadow-2xl ring-2 ring-[#f5c400]" : "hover:border-[#f5c400]/50"}`}>
    <div className="flex items-start gap-1">
      <button type="button" {...attributes} {...listeners} disabled={locked} aria-label="Déplacer le créneau" className={`mt-0.5 shrink-0 rounded text-white/45 ${locked ? "cursor-not-allowed" : "cursor-grab touch-none hover:text-[#f5c400] active:cursor-grabbing"}`}><GripVertical size={14} /></button>
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <span className="flex items-center gap-1 font-black text-white"><Clock3 size={11} />{slot.time}</span>
        <span className="mt-1 block truncate text-white/80"><b className={`mr-1 rounded px-1 py-0.5 text-[8px] text-white ${pitchColors[slot.pitch]}`}>{slot.pitch}</b>{slot.group || "Groupe à préciser"}</span>
        {slot.educator ? <span className="mt-1 block truncate text-[9px] text-white/55">{slot.educator}</span> : null}
      </button>
      <Pencil size={11} className="shrink-0 text-white/30 transition group-hover:text-[#f5c400]" />
    </div>
  </article>;
}

function TrainingDropZone({ board, row, day, locked, onAdd, onEdit }: { board: Board; row: number; day: number; locked: boolean; onAdd: () => void; onEdit: (index: number) => void }) {
  const zoneId = `zone-${row}-${day}`;
  const { setNodeRef, isOver } = useDroppable({ id: zoneId, disabled: locked });
  const slots = board[row].days[day];
  return <div ref={setNodeRef} className={`flex min-h-28 flex-col gap-1.5 border-l border-[#f5c400]/18 p-1.5 transition ${isOver ? "bg-[#0b5a40]/80 ring-2 ring-inset ring-[#f5c400]" : "bg-transparent"}`}>
    <SortableContext items={slots.map((slot) => slot.id!)} strategy={verticalListSortingStrategy}>
      {slots.map((slot, index) => <SortableTrainingCard key={slot.id} slot={slot} locked={locked} onEdit={() => onEdit(index)} />)}
    </SortableContext>
    <button type="button" onClick={onAdd} className="focus-ring mt-auto flex min-h-7 items-center justify-center rounded-md border border-dashed border-[#f5c400]/25 text-[#f5c400]/65 transition hover:border-[#f5c400] hover:bg-[#f5c400]/10 hover:text-[#f5c400]" aria-label={`Ajouter un entraînement ${days[day]} pour ${board[row].category}`}><Plus size={14} /></button>
  </div>;
}

function TrainingModal({ state, board, onClose, onSave, onDelete }: { state: NonNullable<ModalState>; board: Board; onClose: () => void; onSave: (slot: TrainingSlot, row: number, day: number) => void; onDelete: () => void }) {
  const existing = state.mode === "edit" ? board[state.row].days[state.day][state.index!] : undefined;
  const [row, setRow] = useState(state.row); const [day, setDay] = useState(state.day);
  const [start, initialEnd = ""] = (existing?.time ?? "17h30 – 19h00").split(/\s*[–-]\s*/);
  const [form, setForm] = useState({ start: start.replace("h", ":"), end: initialEnd.replace("h", ":"), pitch: existing?.pitch ?? "T2", group: existing?.group ?? "", educator: existing?.educator ?? "", comment: existing?.comment ?? "" });
  const field = "focus-ring min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900";
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4" role="dialog" aria-modal="true" aria-labelledby="training-modal-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <form className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl" onSubmit={(event) => { event.preventDefault(); onSave({ id: existing?.id ?? crypto.randomUUID(), time: `${form.start.replace(":", "h")} – ${form.end.replace(":", "h")}`, pitch: form.pitch as TrainingSlot["pitch"], group: form.group.trim(), educator: form.educator.trim(), comment: form.comment.trim() }, row, day); }}>
      <div className="flex items-center justify-between gap-3"><h2 id="training-modal-title" className="text-xl font-black uppercase text-[#002f1d]">{state.mode === "edit" ? "Modifier l’entraînement" : "Ajouter un entraînement"}</h2><button type="button" onClick={onClose} className="focus-ring rounded p-2 text-slate-500"><X size={21} /></button></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold">Catégorie<select value={row} onChange={(e) => setRow(Number(e.target.value))} className={field}>{board.map((item, index) => <option key={item.category} value={index}>{item.category}</option>)}</select></label>
        <label className="grid gap-1 text-sm font-bold">Jour<select value={day} onChange={(e) => setDay(Number(e.target.value))} className={field}>{days.map((item, index) => <option key={item} value={index}>{item}</option>)}</select></label>
        <label className="grid gap-1 text-sm font-bold">Heure de début<input required type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className={field} /></label>
        <label className="grid gap-1 text-sm font-bold">Heure de fin<input required type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className={field} /></label>
        <label className="grid gap-1 text-sm font-bold">Terrain<select value={form.pitch} onChange={(e) => setForm({ ...form, pitch: e.target.value as TrainingSlot["pitch"] })} className={field}>{pitches.map((pitch) => <option key={pitch}>{pitch}</option>)}</select></label>
        <label className="grid gap-1 text-sm font-bold">Groupe<input value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} className={field} placeholder="Groupe A" /></label>
        <label className="grid gap-1 text-sm font-bold sm:col-span-2">Éducateur<input value={form.educator} onChange={(e) => setForm({ ...form, educator: e.target.value })} className={field} placeholder="Nom de l’éducateur" /></label>
        <label className="grid gap-1 text-sm font-bold sm:col-span-2">Commentaire<textarea rows={3} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} className={`${field} py-2`} /></label>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">{state.mode === "edit" ? <button type="button" onClick={onDelete} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md px-4 font-black uppercase text-red-700 hover:bg-red-50"><Trash2 size={17} /> Supprimer</button> : null}<div className="ml-auto flex gap-2"><button type="button" onClick={onClose} className="focus-ring min-h-11 rounded-md border px-4 font-black uppercase text-slate-700">Annuler</button><button type="submit" className="focus-ring min-h-11 rounded-md bg-[#f7c600] px-5 font-black uppercase text-[#002f1d]">Enregistrer</button></div></div>
    </form>
  </div>;
}

export function TrainingPlanningAdmin({ value, onAuth }: { value: Record<string, unknown> | undefined; onAuth: () => void }) {
  const initial = useMemo(() => normalize(Array.isArray(value?.trainingSchedule) ? value.trainingSchedule as TrainingRow[] : fallbackSchedule), [value]);
  const [board, setBoard] = useState(initial); const [saved, setSaved] = useState(initial);
  const [past, setPast] = useState<Board[]>([]); const [future, setFuture] = useState<Board[]>([]);
  const [locked, setLocked] = useState(true); const [weekLabel, setWeekLabel] = useState(typeof value?.weekLabel === "string" ? value.weekLabel : "Semaine du 2 au 6 septembre 2026");
  const [savedWeek, setSavedWeek] = useState(weekLabel); const [modal, setModal] = useState<ModalState>(null); const [saving, setSaving] = useState(false); const [done, setDone] = useState(false); const [error, setError] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const dirty = JSON.stringify(board) !== JSON.stringify(saved) || weekLabel !== savedWeek;
  const commit = (next: Board) => { setPast((items) => [...items.slice(-29), clone(board)]); setFuture([]); setBoard(next); };
  const undo = () => { const previous = past.at(-1); if (!previous) return; setFuture((items) => [clone(board), ...items]); setPast((items) => items.slice(0, -1)); setBoard(previous); };
  const redo = () => { const next = future[0]; if (!next) return; setPast((items) => [...items, clone(board)]); setFuture((items) => items.slice(1)); setBoard(next); };
  function onDragEnd(event: DragEndEvent) {
    if (locked || !event.over || event.active.id === event.over.id) return;
    const source = findSlot(board, String(event.active.id)); if (!source) return;
    const overId = String(event.over.id); const overSlot = findSlot(board, overId);
    const zone = overId.match(/^zone-(\d+)-(\d+)$/); const targetRow = overSlot?.row ?? Number(zone?.[1]); const targetDay = overSlot?.day ?? Number(zone?.[2]);
    if (!Number.isInteger(targetRow) || !Number.isInteger(targetDay)) return;
    const next = clone(board); const [moving] = next[source.row].days[source.day].splice(source.index, 1); let targetIndex = overSlot?.index ?? next[targetRow].days[targetDay].length;
    if (source.row === targetRow && source.day === targetDay && source.index < targetIndex) targetIndex -= 1;
    next[targetRow].days[targetDay].splice(Math.max(0, targetIndex), 0, moving); commit(next);
  }
  function saveModal(slot: TrainingSlot, targetRow: number, targetDay: number) {
    if (!modal) return; const next = clone(board);
    if (modal.mode === "edit") next[modal.row].days[modal.day].splice(modal.index!, 1);
    next[targetRow].days[targetDay].push(slot); commit(next); setModal(null);
  }
  function deleteModal() { if (!modal || modal.mode !== "edit") return; const next = clone(board); next[modal.row].days[modal.day].splice(modal.index!, 1); commit(next); setModal(null); }
  async function save() {
    setSaving(true); setError(""); setDone(false);
    try { const response = await fetch("/api/admin/settings/home_sports", { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weekLabel, trainingSchedule: board }) }); if (response.status === 401) { onAuth(); return; } const json = await response.json().catch(() => null); if (!response.ok || !json?.ok) throw new Error(json?.error?.message ?? "Enregistrement impossible."); setSaved(clone(board)); setSavedWeek(weekLabel); setPast([]); setFuture([]); setDone(true); window.setTimeout(() => setDone(false), 2500); }
    catch (cause) { setBoard(clone(saved)); setWeekLabel(savedWeek); setPast([]); setFuture([]); setError(`${cause instanceof Error ? cause.message : "Erreur réseau."} Les changements ont été annulés.`); }
    finally { setSaving(false); }
  }
  return <section id="home_sports" className="scroll-mt-4 overflow-hidden rounded-xl border border-[#f7c600]/45 bg-[#002f21] text-white shadow-sm">
    <div className="flex flex-wrap items-center gap-2 border-b border-[#f7c600]/25 bg-[#001f16] p-4"><strong className="mr-auto uppercase tracking-wide text-[#f7c600]">Mode planning</strong><button type="button" onClick={() => setLocked(!locked)} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-white/15 px-3 text-xs font-black uppercase">{locked ? <Lock size={15} /> : <Unlock size={15} />}{locked ? "Déverrouiller" : "Verrouiller"}</button><button type="button" disabled={!past.length} onClick={undo} className="focus-ring rounded-md border border-white/15 p-2.5 disabled:opacity-35" aria-label="Annuler"><Undo2 size={17} /></button><button type="button" disabled={!future.length} onClick={redo} className="focus-ring rounded-md border border-white/15 p-2.5 disabled:opacity-35" aria-label="Rétablir"><Redo2 size={17} /></button><button type="button" disabled={!dirty || saving} onClick={() => void save()} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md bg-[#f7c600] px-4 text-xs font-black uppercase text-[#002f1d] disabled:opacity-45">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Enregistrer</button></div>
    <div className="flex flex-wrap items-center gap-3 px-4 py-3"><label className="flex min-w-[18rem] flex-1 items-center gap-3 text-xs font-black uppercase text-white/70">Semaine<input value={weekLabel} onChange={(e) => setWeekLabel(e.target.value)} className="focus-ring min-h-10 flex-1 rounded-md border border-[#f7c600]/25 bg-white/5 px-3 text-sm font-bold normal-case text-white" /></label>{dirty ? <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-black text-amber-300">Modifications non enregistrées</span> : null}{done ? <span className="flex items-center gap-1 text-xs font-black text-emerald-300"><Check size={15} /> Enregistré</span> : null}</div>
    {error ? <p className="mx-4 mb-3 rounded-md bg-red-950/60 p-3 text-sm font-bold text-red-200">{error}</p> : null}
    <div className="overflow-x-auto px-4 pb-4 [scrollbar-color:#f7c600_#003c29]"><DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}><div className="min-w-[900px] overflow-hidden rounded-xl border border-[#f7c600]/25"><div className="grid grid-cols-[150px_repeat(5,minmax(145px,1fr))] bg-[#001f16] text-center text-xs font-black uppercase text-[#f7c600]"><span className="p-3" />{days.map((day) => <span key={day} className="border-l border-[#f7c600]/20 p-3">{day}</span>)}</div>{board.map((row, rowIndex) => <div key={row.category} className="grid grid-cols-[150px_repeat(5,minmax(145px,1fr))] border-t border-[#f7c600]/20"><div className="flex items-center gap-2 px-3" style={{ color: row.accent }}><UsersRound size={22} /><div><p className="text-sm font-black uppercase text-white">{row.category}</p><p className="text-[9px] font-bold uppercase">{row.subtitle}</p></div></div>{days.map((_, dayIndex) => <TrainingDropZone key={dayIndex} board={board} row={rowIndex} day={dayIndex} locked={locked} onAdd={() => setModal({ mode: "create", row: rowIndex, day: dayIndex })} onEdit={(index) => setModal({ mode: "edit", row: rowIndex, day: dayIndex, index })} />)}</div>)}</div></DndContext></div>
    {modal ? <TrainingModal key={`${modal.mode}-${modal.row}-${modal.day}-${modal.index ?? "new"}`} state={modal} board={board} onClose={() => setModal(null)} onSave={saveModal} onDelete={deleteModal} /> : null}
  </section>;
}
