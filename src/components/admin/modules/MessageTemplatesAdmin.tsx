"use client";

import { AdminCrud } from "@/components/admin/AdminCrud";
import { MESSAGE_CHANNELS, MESSAGE_PLACEHOLDERS, messageChannelLabel } from "@/lib/messaging";

const CHANNEL_OPTIONS = MESSAGE_CHANNELS.map((c) => ({ value: c.value, label: c.label }));

export function MessageTemplatesAdmin() {
  return (
    <AdminCrud
      title="Modèles de messages"
      description={`Créez des modèles d'e-mails / SMS réutilisables (pour les rappels et les campagnes). Variables disponibles dans l'objet et le corps : ${MESSAGE_PLACEHOLDERS.join(", ")}.`}
      endpoint="/api/admin/message-templates"
      listKey="messageTemplates"
      itemKey="messageTemplate"
      newLabel="Nouveau modèle"
      allowDelete
      deleteMode="soft"
      rowLabel={(r) => `le modèle « ${String(r.name ?? "")} »`}
      fields={[
        { name: "name", label: "Nom du modèle", required: true, fullWidth: true, placeholder: "Rappel de cotisation" },
        { name: "key", label: "Clé technique", required: true, placeholder: "rappel_cotisation", help: "Minuscules, chiffres, « _ ». Non modifiable après création." },
        { name: "channel", label: "Canal", type: "select", options: CHANNEL_OPTIONS },
        { name: "subject", label: "Objet (e-mail)", fullWidth: true, placeholder: "Rappel : cotisation {saison}" },
        { name: "body", label: "Corps du message", type: "textarea", required: true, fullWidth: true, help: `Variables : ${MESSAGE_PLACEHOLDERS.join(", ")}` },
        { name: "description", label: "Description", placeholder: "À quoi sert ce modèle ? (facultatif)" },
        { name: "orderIndex", label: "Ordre", type: "number", rowKey: "order_index" },
        { name: "isActive", label: "Actif", type: "boolean", rowKey: "is_active" }
      ]}
      columns={[
        { label: "Modèle", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.name ?? "—")}</span> },
        { label: "Clé", render: (r) => <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{String(r.key ?? "—")}</code> },
        { label: "Canal", render: (r) => messageChannelLabel(String(r.channel ?? "")) },
        { label: "Actif", render: (r) => (r.is_active ? <span className="font-black text-emerald-700">✓</span> : <span className="text-slate-400">—</span>) }
      ]}
    />
  );
}
