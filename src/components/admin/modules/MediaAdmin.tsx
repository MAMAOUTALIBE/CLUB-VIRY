"use client";

import { AdminCrud } from "@/components/admin/AdminCrud";

function fmtDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

const STATUS = [
  { value: "DRAFT", label: "Brouillon (non visible)" },
  { value: "PUBLISHED", label: "Publié (visible sur le site)" },
  { value: "ARCHIVED", label: "Archivé" }
];

export function MediaAdmin() {
  return (
    <AdminCrud
      title="Médias — Albums"
      description="Créez des albums photos/vidéos. Les albums « Publié » apparaissent dans la galerie /medias du site."
      listEndpoint="/api/admin/media"
      endpoint="/api/admin/media/albums"
      listKey="albums"
      itemKey="album"
      newLabel="Nouvel album"
      fields={[
        { name: "title", label: "Titre de l'album", required: true, fullWidth: true, placeholder: "Tournoi U11 2026" },
        { name: "coverImageUrl", label: "Image de couverture (URL)", type: "url", rowKey: "cover_image_url", placeholder: "https://…" },
        { name: "status", label: "Statut", type: "select", options: STATUS },
        { name: "publishedAt", label: "Date de publication", type: "datetime", rowKey: "published_at" },
        { name: "description", label: "Description", type: "textarea" }
      ]}
      columns={[
        { label: "Album", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.title ?? "—")}</span> },
        { label: "Statut", render: (r) => STATUS.find((s) => s.value === r.status)?.label ?? String(r.status ?? "—") },
        { label: "Publié le", render: (r) => fmtDate(r.published_at) }
      ]}
    />
  );
}
