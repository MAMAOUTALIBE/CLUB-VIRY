"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminCrud } from "@/components/admin/AdminCrud";
import { showToast } from "@/components/admin/Toast";
import { MESSAGE_CHANNELS, messageChannelLabel } from "@/lib/messaging";
import { SCHEDULED_CONDITIONS, scheduledConditionLabel } from "@/lib/scheduled-automations";

const CHANNEL_OPTIONS = MESSAGE_CHANNELS.map((c) => ({ value: c.value, label: c.label }));
const CONDITION_OPTIONS = SCHEDULED_CONDITIONS.map((c) => ({ value: c.value, label: c.label }));

function formatDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "Jamais";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function RelancesAdmin() {
  const [templateOptions, setTemplateOptions] = useState([{ value: "", label: "— Message par défaut —" }]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [running, setRunning] = useState(false);

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/message-templates", { credentials: "same-origin" });
      const json = await res.json().catch(() => null);
      const list = json?.ok && Array.isArray(json.data?.messageTemplates) ? json.data.messageTemplates : [];
      setTemplateOptions([{ value: "", label: "— Message par défaut —" }, ...list.map((t: { id: string; name: string }) => ({ value: t.id, label: t.name }))]);
    } catch {
      /* silencieux */
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void loadTemplates(), 0);
    return () => window.clearTimeout(t);
  }, [loadTemplates]);

  async function runNow() {
    setRunning(true);
    try {
      const res = await fetch("/api/admin/scheduled-automations/run", { method: "POST", credentials: "same-origin" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        showToast(json?.error?.message ?? "Évaluation impossible.", "error");
        return;
      }
      const a = json.data.automations as { evaluated: number; triggered: number; totalMatches: number };
      const r = json.data.reminders as { processed: number };
      showToast(`Règles évaluées : ${a.evaluated} · déclenchées : ${a.triggered} (${a.totalMatches} éléments) · rappels traités : ${r.processed}.`);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Erreur réseau.", "error");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#07542f]/20 bg-[#fbfcf8] p-4">
        <p className="max-w-xl text-sm text-slate-600">
          Règles conditionnelles (relances) : à intervalle régulier, elles comptent les éléments correspondant à une condition et envoient une notification. <strong>Aucune donnée n'est modifiée.</strong> Le déclenchement est automatique si un cron est branché, ou manuel ci-contre.
        </p>
        <button type="button" onClick={() => void runNow()} disabled={running} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-[#002f1d] px-4 text-sm font-black uppercase text-white hover:bg-[#07542f] disabled:cursor-wait disabled:opacity-70">
          {running ? "Évaluation…" : "Évaluer maintenant"}
        </button>
      </div>

      <AdminCrud
        key={refreshKey}
        title="Relances automatiques"
        description="Définissez des règles « si N éléments en attente depuis X jours → notifier »."
        endpoint="/api/admin/scheduled-automations"
        listKey="scheduledAutomations"
        itemKey="scheduledAutomation"
        newLabel="Nouvelle règle"
        allowDelete
        deleteMode="soft"
        viewsScope="relances"
        rowLabel={(r) => `la règle « ${String(r.name ?? "")} »`}
        fields={[
          { name: "name", label: "Nom de la règle", required: true, fullWidth: true, placeholder: "Relancer les inscriptions en attente" },
          { name: "conditionKey", label: "Condition", type: "select", options: CONDITION_OPTIONS, rowKey: "condition_key", required: true },
          { name: "thresholdDays", label: "Seuil (jours)", type: "number", rowKey: "threshold_days", help: "Ancienneté minimale pour déclencher." },
          { name: "channel", label: "Canal", type: "select", options: CHANNEL_OPTIONS },
          { name: "templateId", label: "Modèle (facultatif)", type: "select", options: templateOptions, rowKey: "template_id", help: "Variables : {count}, {jours}." },
          { name: "recipientEmail", label: "E-mail destinataire", rowKey: "recipient_email", placeholder: "facultatif" },
          { name: "isActive", label: "Active", type: "boolean", rowKey: "is_active" }
        ]}
        columns={[
          { label: "Règle", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.name ?? "—")}</span> },
          { label: "Condition", render: (r) => scheduledConditionLabel(String(r.condition_key ?? "")) },
          { label: "Seuil", render: (r) => `${String(r.threshold_days ?? "—")} j` },
          { label: "Canal", render: (r) => messageChannelLabel(String(r.channel ?? "")) },
          { label: "Active", render: (r) => (r.is_active ? <span className="font-black text-emerald-700">✓</span> : <span className="text-slate-400">—</span>) },
          { label: "Dernier passage", render: (r) => <span className="text-xs">{formatDate(r.last_run_at)}{typeof r.last_match_count === "number" ? ` · ${r.last_match_count}` : ""}</span> }
        ]}
      />
    </div>
  );
}
