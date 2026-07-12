"use client";

import { useEffect, useState } from "react";

import { AdminCrud, imageUploadField } from "@/components/admin/AdminCrud";
import type { CrudField } from "@/components/admin/AdminCrud";

type TeamOption = { id: string; name: string };

const TYPES = [
  { value: "PHOTO", label: "Photo" },
  { value: "VIDEO", label: "Vidéo" }
];

function fmtDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function MediaAssetsAdmin() {
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
    { name: "title", label: "Titre", required: true, fullWidth: true, placeholder: "Finale U13 — célébration" },
    { name: "type", label: "Type", type: "select", options: TYPES },
    {
      name: "teamId",
      label: "Équipe concernée (ciblage automatique)",
      type: "select",
      rowKey: "team_id",
      fullWidth: true,
      options: [{ value: "", label: "— Aucune équipe —" }, ...teams.map((team) => ({ value: team.id, label: team.name }))],
      help: "Si une équipe est choisie, les familles concernées reçoivent automatiquement une notification « nouvelle photo/vidéo »."
    },
    { name: "url", label: "URL du média", type: "url", required: true, fullWidth: true, placeholder: "https://… (photo ou vidéo)" },
    imageUploadField({ targetField: "url", folder: "medias", label: "…ou téléverser une photo", help: "Pour une photo (JPEG/PNG/WebP, 5 Mo max). Pour une vidéo, collez l'URL ci-dessus." }),
    { name: "thumbnailUrl", label: "Vignette (URL)", type: "url", rowKey: "thumbnail_url", placeholder: "https://… (optionnel)" },
    imageUploadField({ targetField: "thumbnailUrl", folder: "medias", label: "…ou téléverser une vignette" }),
    { name: "altText", label: "Texte alternatif (accessibilité)", rowKey: "alt_text", fullWidth: true, placeholder: "Description de l'image" },
    { name: "isFeatured", label: "Mis en avant", type: "boolean", rowKey: "is_featured" },
    { name: "publishedAt", label: "Date de publication", type: "datetime", rowKey: "published_at" }
  ];

  return (
    <AdminCrud
      title="Médiathèque — photos & vidéos"
      description="Gérez les médias du club. En rattachant un média à une équipe, les familles concernées sont notifiées automatiquement (CRM intelligent)."
      listEndpoint="/api/admin/media"
      endpoint="/api/admin/media/assets"
      listKey="assets"
      itemKey="asset"
      newLabel="Nouveau média"
      allowDelete
      rowLabel={(r) => `« ${String(r.title ?? "ce média")} »`}
      fields={fields}
      columns={[
        { label: "Titre", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.title ?? "—")}</span> },
        { label: "Type", render: (r) => (r.type === "VIDEO" ? "Vidéo" : "Photo") },
        { label: "Équipe", render: (r) => teamName(r.team_id) },
        { label: "En avant", render: (r) => (r.is_featured ? <span className="font-black text-emerald-700">✓</span> : <span className="text-slate-400">—</span>) },
        { label: "Publié le", render: (r) => fmtDate(r.published_at) }
      ]}
    />
  );
}
