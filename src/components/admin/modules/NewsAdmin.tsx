"use client";

import { useEffect, useState } from "react";

import { AdminCrud, imageUploadField } from "@/components/admin/AdminCrud";
import type { CrudField } from "@/components/admin/AdminCrud";

type TeamOption = { id: string; name: string };

function fmtDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PUBLISHED: { label: "Publié", cls: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  DRAFT: { label: "Brouillon", cls: "bg-slate-100 text-slate-700 ring-slate-200" },
  ARCHIVED: { label: "Archivé", cls: "bg-amber-50 text-amber-800 ring-amber-200" }
};

function StatusBadge({ value }: { value: unknown }) {
  const s = STATUS_LABEL[String(value)] ?? { label: String(value ?? "—"), cls: "bg-slate-100 text-slate-700 ring-slate-200" };
  return <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-black uppercase ring-1 ${s.cls}`}>{s.label}</span>;
}

export function NewsAdmin() {
  const [teams, setTeams] = useState<TeamOption[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const res = await fetch("/api/admin/teams?limit=200", { credentials: "same-origin" }).catch(() => null);
      const json = res ? await res.json().catch(() => null) : null;
      if (json?.ok && Array.isArray(json.data?.teams)) {
        setTeams(json.data.teams.map((team: { id: string; name: string }) => ({ id: team.id, name: team.name })));
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const teamName = (id: unknown) => (typeof id === "string" ? teams.find((team) => team.id === id)?.name ?? "—" : "—");

  const fields: CrudField[] = [
    { name: "title", label: "Titre", required: true, fullWidth: true, placeholder: "Victoire des Seniors !" },
    { name: "excerpt", label: "Extrait (résumé court)", type: "textarea", help: "≤ 300 caractères — affiché dans les cartes." },
    { name: "content", label: "Contenu de l'article", type: "textarea", required: true, help: "≥ 20 caractères." },
    { name: "coverImageUrl", label: "Image de couverture (URL)", type: "url", rowKey: "cover_image_url", placeholder: "https://…" },
    imageUploadField({ targetField: "coverImageUrl", folder: "actualites", label: "…ou téléverser l'image de couverture" }),
    {
      name: "status",
      label: "Statut",
      type: "select",
      options: [
        { value: "DRAFT", label: "Brouillon (non visible)" },
        { value: "PUBLISHED", label: "Publié (visible sur le site)" },
        { value: "ARCHIVED", label: "Archivé" }
      ]
    },
    {
      name: "teamId",
      label: "Équipe ciblée (diffusion auto)",
      type: "select",
      rowKey: "team_id",
      fullWidth: true,
      options: [{ value: "", label: "— Aucune (pas de notification ciblée) —" }, ...teams.map((team) => ({ value: team.id, label: team.name }))],
      help: "Si une équipe est choisie, ses familles reçoivent une notification à la première publication de l'article."
    },
    { name: "publishedAt", label: "Date de publication", type: "datetime", rowKey: "published_at", help: "Vide = visible dès la publication. Une date future (avec statut « Publié ») programme la mise en ligne automatique à cette date." },
    { name: "slug", label: "Slug (lien)", help: "Optionnel — généré depuis le titre si vide." }
  ];

  return (
    <AdminCrud
      title="Actualités"
      description="Créez et publiez les actualités du club. Elles apparaissent sur l'accueil et la page /actualites. Ciblez une équipe pour notifier automatiquement ses familles."
      endpoint="/api/admin/news"
      listKey="news"
      itemKey="article"
      newLabel="Nouvel article"
      allowDelete
      allowBulkDelete
      deleteMode="soft"
      rowLabel={(r) => `« ${String(r.title ?? "cet article")} »`}
      fields={fields}
      columns={[
        { label: "Titre", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.title ?? "—")}</span> },
        { label: "Statut", render: (r) => <StatusBadge value={r.status} /> },
        { label: "Équipe ciblée", render: (r) => teamName(r.team_id) },
        { label: "Publié le", render: (r) => fmtDate(r.published_at) }
      ]}
    />
  );
}
