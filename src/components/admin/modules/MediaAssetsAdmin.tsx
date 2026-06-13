"use client";

import { AdminCrud } from "@/components/admin/AdminCrud";

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
  return (
    <AdminCrud
      title="Médiathèque — photos & vidéos"
      description="Gérez les médias individuels (photos, vidéos) du club. Chaque média peut être mis en avant et daté. Liste centralisée réutilisable dans les galeries du site."
      listEndpoint="/api/admin/media"
      endpoint="/api/admin/media/assets"
      listKey="assets"
      itemKey="asset"
      newLabel="Nouveau média"
      fields={[
        { name: "title", label: "Titre", required: true, fullWidth: true, placeholder: "Finale U13 — célébration" },
        { name: "type", label: "Type", type: "select", options: TYPES },
        { name: "url", label: "URL du média", type: "url", required: true, fullWidth: true, placeholder: "https://… (photo ou vidéo)" },
        { name: "thumbnailUrl", label: "Vignette (URL)", type: "url", rowKey: "thumbnail_url", placeholder: "https://… (miniature, optionnel)" },
        { name: "altText", label: "Texte alternatif (accessibilité)", rowKey: "alt_text", fullWidth: true, placeholder: "Description de l'image" },
        { name: "isFeatured", label: "Mis en avant", type: "boolean", rowKey: "is_featured" },
        { name: "publishedAt", label: "Date de publication", type: "datetime", rowKey: "published_at" }
      ]}
      columns={[
        { label: "Titre", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.title ?? "—")}</span> },
        { label: "Type", render: (r) => (r.type === "VIDEO" ? "Vidéo" : "Photo") },
        { label: "En avant", render: (r) => (r.is_featured ? <span className="font-black text-emerald-700">✓</span> : <span className="text-slate-400">—</span>) },
        { label: "Publié le", render: (r) => fmtDate(r.published_at) }
      ]}
    />
  );
}
