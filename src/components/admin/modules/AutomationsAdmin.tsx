"use client";

import { Bell, CalendarDays, Camera, Loader2, Megaphone, RefreshCw, Trophy, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { AUTOMATION_KEYS, type AutomationDefinition, type AutomationKey, type AutomationRunStatus } from "@/lib/automations";

type AutomationRun = {
  id: string;
  rule_key: string;
  status: AutomationRunStatus;
  message: string | null;
  affected_count: number;
  created_at: string;
};

type AutomationRule = AutomationDefinition & {
  isEnabled: boolean;
  updatedAt: string | null;
  lastRun: AutomationRun | null;
};

const ICONS: Record<AutomationDefinition["iconName"], LucideIcon> = {
  trophy: Trophy,
  calendar: CalendarDays,
  camera: Camera,
  megaphone: Megaphone,
  "user-plus": UserPlus,
  bell: Bell
};

const STATUS_LABELS: Record<AutomationRunStatus, string> = {
  SUCCESS: "Exécutée",
  SKIPPED: "Ignorée",
  FAILED: "Échec"
};

const STATUS_CLASSES: Record<AutomationRunStatus, string> = {
  SUCCESS: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  SKIPPED: "bg-slate-100 text-slate-600 ring-slate-200",
  FAILED: "bg-red-50 text-red-700 ring-red-200"
};

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date);
}

function StatusBadge({ status }: { status: AutomationRunStatus }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-black uppercase ring-1 ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function AutomationsAdmin() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingKey, setPendingKey] = useState<AutomationKey | null>(null);
  const [error, setError] = useState("");
  const [ruleFilter, setRuleFilter] = useState<"" | AutomationKey>("");
  const [statusFilter, setStatusFilter] = useState<"" | AutomationRunStatus>("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (ruleFilter) params.set("rule", ruleFilter);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/automations?${params.toString()}`, { credentials: "same-origin" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error?.message ?? `Chargement impossible (HTTP ${res.status}).`);
        return;
      }
      setRules(json.data.rules as AutomationRule[]);
      setRuns(json.data.runs as AutomationRun[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }, [ruleFilter, statusFilter]);

  // Même contournement que AdminCrud : différer le premier chargement hors du rendu de l'effet.
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function toggle(rule: AutomationRule) {
    setPendingKey(rule.key);
    setError("");
    try {
      const res = await fetch(`/api/admin/automations/${rule.key}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !rule.isEnabled })
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error?.message ?? `Échec de la bascule (HTTP ${res.status}).`);
        return;
      }
      setRules((current) => current.map((item) => (item.key === rule.key ? { ...item, isEnabled: !rule.isEnabled } : item)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau.");
    } finally {
      setPendingKey(null);
    }
  }

  const disabledCount = rules.filter((rule) => !rule.isEnabled).length;

  return (
    <div className="grid gap-4">
      <section className="official-card rounded-lg bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-[#07542f]">Module CRM</p>
            <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Automatisations</h2>
          </div>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-black uppercase text-[#002f1d] hover:bg-slate-50 disabled:opacity-70"
            type="button"
          >
            {loading ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <RefreshCw size={16} aria-hidden="true" />} Actualiser
          </button>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Certains événements déclenchent automatiquement des actions, en respectant les préférences de notification de chaque destinataire.
          Désactiver une règle la neutralise immédiatement sur tout le club : le déclencheur reste tracé dans le journal, mais l&apos;action n&apos;a pas lieu.
        </p>

        {disabledCount > 0 ? (
          <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
            ⚠️ {disabledCount === 1 ? "1 automatisation est désactivée" : `${disabledCount} automatisations sont désactivées`} : les actions correspondantes ne se déclenchent plus.
          </p>
        ) : null}

        {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}

        <div className="mt-4 grid gap-3">
          {rules.length === 0 && !loading ? <p className="text-sm font-semibold text-slate-500">Aucune automatisation à afficher.</p> : null}
          {rules.map((rule) => {
            const Icon = ICONS[rule.iconName];
            const busy = pendingKey === rule.key;
            return (
              <div
                className={`flex flex-wrap items-start gap-3 rounded-lg border p-4 ${rule.isEnabled ? "border-slate-200 bg-[#fbfcf8]" : "border-slate-200 bg-slate-50 opacity-80"}`}
                key={rule.key}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#07542f]/10 text-[#07542f]" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-[#002f1d]">
                    {rule.event} <span className="text-slate-400">→</span> {rule.action}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-600">Destinataires : {rule.audience}</p>
                  {rule.isEnabled ? null : <p className="mt-1 text-xs font-bold text-amber-800">Conséquence : {rule.impact}</p>}
                  {rule.lastRun ? (
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                      <StatusBadge status={rule.lastRun.status} />
                      Dernière exécution le {formatDateTime(rule.lastRun.created_at)}
                      {rule.lastRun.affected_count > 0 ? ` — ${rule.lastRun.affected_count} destinataire(s)` : ""}
                      {rule.lastRun.message ? ` — ${rule.lastRun.message}` : ""}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs font-semibold text-slate-400">Jamais déclenchée depuis la mise en service du journal.</p>
                  )}
                </div>
                <button
                  onClick={() => void toggle(rule)}
                  disabled={busy || loading}
                  aria-pressed={rule.isEnabled}
                  className={`focus-ring inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-black uppercase disabled:opacity-70 ${
                    rule.isEnabled ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-300 text-slate-700 hover:bg-slate-400"
                  }`}
                  type="button"
                >
                  {busy ? <Loader2 className="animate-spin" size={14} aria-hidden="true" /> : null}
                  {rule.isEnabled ? "Active" : "Désactivée"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="official-card rounded-lg bg-white p-5">
        <h3 className="text-lg font-black uppercase text-[#002f1d]">Journal d&apos;exécution</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Chaque déclenchement est tracé : réussite, règle désactivée, ou échec avec son message d&apos;erreur.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <label className="text-xs font-black uppercase text-slate-500">
            <span className="sr-only">Filtrer par automatisation</span>
            <select
              value={ruleFilter}
              onChange={(event) => setRuleFilter(event.target.value as "" | AutomationKey)}
              className="focus-ring min-h-11 rounded-md border border-slate-300 px-3 text-sm font-semibold text-[#002f1d]"
            >
              <option value="">Toutes les automatisations</option>
              {AUTOMATION_KEYS.map((key) => (
                <option key={key} value={key}>
                  {rules.find((rule) => rule.key === key)?.event ?? key}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-black uppercase text-slate-500">
            <span className="sr-only">Filtrer par statut</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "" | AutomationRunStatus)}
              className="focus-ring min-h-11 rounded-md border border-slate-300 px-3 text-sm font-semibold text-[#002f1d]"
            >
              <option value="">Tous les statuts</option>
              <option value="SUCCESS">Exécutée</option>
              <option value="SKIPPED">Ignorée</option>
              <option value="FAILED">Échec</option>
            </select>
          </label>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-black uppercase text-slate-500">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Automatisation</th>
                <th className="py-2 pr-3">Statut</th>
                <th className="py-2 pr-3">Destinataires</th>
                <th className="py-2">Détail</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td className="py-4 text-sm font-semibold text-slate-500" colSpan={5}>
                    {loading ? "Chargement…" : "Aucune exécution enregistrée pour ce filtre."}
                  </td>
                </tr>
              ) : null}
              {runs.map((run) => (
                <tr className="border-b border-slate-100 align-top" key={run.id}>
                  <td className="py-2 pr-3 font-semibold text-slate-600">{formatDateTime(run.created_at)}</td>
                  <td className="py-2 pr-3 font-bold text-[#002f1d]">{rules.find((rule) => rule.key === run.rule_key)?.event ?? run.rule_key}</td>
                  <td className="py-2 pr-3">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="py-2 pr-3 font-semibold text-slate-600">{run.affected_count}</td>
                  <td className="py-2 text-slate-600">{run.message ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
