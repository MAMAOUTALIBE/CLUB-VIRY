"use client";

import { AdminCrud } from "@/components/admin/AdminCrud";

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
  return (
    <AdminCrud
      title="Actualités"
      description="Créez et publiez les actualités du club. Elles apparaissent sur l'accueil et la page /actualites du site."
      endpoint="/api/admin/news"
      listKey="news"
      itemKey="article"
      newLabel="Nouvel article"
      fields={[
        { name: "title", label: "Titre", required: true, fullWidth: true, placeholder: "Victoire des Seniors !" },
        { name: "excerpt", label: "Extrait (résumé court)", type: "textarea", help: "≤ 300 caractères — affiché dans les cartes." },
        { name: "content", label: "Contenu de l'article", type: "textarea", required: true, help: "≥ 20 caractères." },
        { name: "coverImageUrl", label: "Image de couverture (URL)", type: "url", rowKey: "cover_image_url", placeholder: "https://…" },
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
        { name: "publishedAt", label: "Date de publication", type: "datetime", rowKey: "published_at", help: "Laisser vide = maintenant à la publication." },
        { name: "slug", label: "Slug (lien)", help: "Optionnel — généré depuis le titre si vide." }
      ]}
      columns={[
        { label: "Titre", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.title ?? "—")}</span> },
        { label: "Statut", render: (r) => <StatusBadge value={r.status} /> },
        { label: "Publié le", render: (r) => fmtDate(r.published_at) },
        { label: "Créé le", render: (r) => fmtDate(r.created_at) }
      ]}
    />
  );
}
