"use client";

import { AdminCrud } from "@/components/admin/AdminCrud";

function fmtDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function SeasonsAdmin() {
  return (
    <AdminCrud
      title="Saisons sportives"
      description="Gérez les saisons du club. La saison « active » sert de référence aux inscriptions et à l'affichage du CRM. Une seule saison peut être active à la fois."
      endpoint="/api/admin/seasons"
      listKey="seasons"
      itemKey="season"
      newLabel="Nouvelle saison"
      fields={[
        { name: "name", label: "Nom de la saison", required: true, fullWidth: true, placeholder: "2026 / 2027" },
        { name: "startsOn", label: "Début", type: "date", rowKey: "starts_on", required: true },
        { name: "endsOn", label: "Fin", type: "date", rowKey: "ends_on", required: true },
        { name: "isActive", label: "Saison active", type: "boolean", rowKey: "is_active", help: "Oui = saison de référence. Activer celle-ci désactive automatiquement les autres." }
      ]}
      columns={[
        { label: "Saison", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.name ?? "—")}</span> },
        { label: "Début", render: (r) => fmtDate(r.starts_on) },
        { label: "Fin", render: (r) => fmtDate(r.ends_on) },
        {
          label: "Active",
          render: (r) =>
            r.is_active ? (
              <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black uppercase text-emerald-700 ring-1 ring-emerald-200">Active</span>
            ) : (
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black uppercase text-slate-500 ring-1 ring-slate-200">Archivée</span>
            )
        }
      ]}
    />
  );
}
