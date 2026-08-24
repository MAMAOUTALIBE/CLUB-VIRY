"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminCrud } from "@/components/admin/AdminCrud";
import { showToast } from "@/components/admin/Toast";
import { MESSAGE_CHANNELS, REMINDER_STATUSES, messageChannelLabel, reminderStatusLabel } from "@/lib/messaging";

const CHANNEL_OPTIONS = MESSAGE_CHANNELS.map((c) => ({ value: c.value, label: c.label }));
const STATUS_OPTIONS = REMINDER_STATUSES.map((s) => ({ value: s.value, label: s.label }));

type TemplateOption = { value: string; label: string };

function formatDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function RemindersAdmin() {
  const [templateOptions, setTemplateOptions] = useState<TemplateOption[]>([{ value: "", label: "— Aucun modèle —" }]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [processing, setProcessing] = useState(false);

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/message-templates", { credentials: "same-origin" });
      const json = await res.json().catch(() => null);
      const list = json?.ok && Array.isArray(json.data?.messageTemplates) ? json.data.messageTemplates : [];
      setTemplateOptions([{ value: "", label: "— Aucun modèle —" }, ...list.map((t: { id: string; name: string }) => ({ value: t.id, label: t.name }))]);
    } catch {
      /* silencieux */
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void loadTemplates(), 0);
    return () => window.clearTimeout(t);
  }, [loadTemplates]);

  async function processDue() {
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/reminders/process", { method: "POST", credentials: "same-origin" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        showToast(json?.error?.message ?? "Traitement impossible.", "error");
        return;
      }
      const d = json.data as { processed: number; inApp: number; queuedEmail: number; smsPending: number };
      showToast(
        d.processed === 0
          ? "Aucun rappel échu à traiter."
          : `${d.processed} rappel(s) traité(s) · ${d.inApp} notif. interne, ${d.queuedEmail} e-mail en file${d.smsPending ? `, ${d.smsPending} SMS en attente` : ""}.`
      );
      setRefreshKey((k) => k + 1);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Erreur réseau.", "error");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#07542f]/20 bg-[#fbfcf8] p-4">
        <p className="max-w-xl text-sm text-slate-600">
          Les rappels échus sont traités (notification interne immédiate, e-mail mis en file) quand vous cliquez ci-contre — ou automatiquement si un cron est branché sur cet endpoint.
        </p>
        <button
          type="button"
          onClick={() => void processDue()}
          disabled={processing}
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-[#002f1d] px-4 text-sm font-black uppercase text-white hover:bg-[#07542f] disabled:cursor-wait disabled:opacity-70"
        >
          {processing ? "Traitement…" : "Traiter les rappels échus"}
        </button>
      </div>

      <AdminCrud
        key={refreshKey}
        title="Rappels planifiés"
        description="Programmez des rappels datés (relances, échéances…). À l'échéance, un rappel crée une notification interne (immédiate) ou un e-mail (mis en file pour l'envoi)."
        endpoint="/api/admin/reminders"
        listKey="reminders"
        itemKey="reminder"
        newLabel="Nouveau rappel"
        allowDelete
        deleteMode="soft"
        rowLabel={(r) => `le rappel « ${String(r.title ?? "")} »`}
        fields={[
          { name: "title", label: "Titre", required: true, fullWidth: true, placeholder: "Relancer les dossiers incomplets" },
          { name: "channel", label: "Canal", type: "select", options: CHANNEL_OPTIONS },
          { name: "runAt", label: "Échéance", type: "datetime", required: true, rowKey: "run_at" },
          { name: "templateId", label: "Modèle (facultatif)", type: "select", options: templateOptions, rowKey: "template_id", help: "Si choisi, son objet/corps sert de message." },
          { name: "subject", label: "Objet", fullWidth: true, placeholder: "Objet du message (facultatif)" },
          { name: "body", label: "Message", type: "textarea", fullWidth: true, placeholder: "Contenu du rappel (facultatif si un modèle est choisi)" },
          { name: "recipientEmail", label: "E-mail destinataire", rowKey: "recipient_email", placeholder: "facultatif — vide = notification interne" },
          { name: "status", label: "Statut", type: "select", options: STATUS_OPTIONS }
        ]}
        columns={[
          { label: "Rappel", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.title ?? "—")}</span> },
          { label: "Canal", render: (r) => messageChannelLabel(String(r.channel ?? "")) },
          { label: "Échéance", render: (r) => formatDate(r.run_at) },
          {
            label: "Statut",
            render: (r) => {
              const s = String(r.status ?? "");
              const cls = s === "SENT" ? "text-emerald-700" : s === "CANCELLED" ? "text-slate-400" : "text-[#664d00]";
              return <span className={`font-black ${cls}`}>{reminderStatusLabel(s)}</span>;
            }
          }
        ]}
      />
    </div>
  );
}
