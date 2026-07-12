"use client";

import { AdminCrud, imageUploadField } from "@/components/admin/AdminCrud";

export function OfficialsAdmin() {
  return (
    <AdminCrud
      title="Direction — bureau & dirigeants"
      description="Gérez les personnes affichées sur la page publique Organigramme. Catégorie « Bureau exécutif » = Président, Trésorier, Secrétaire… ; « Dirigeant » = autres responsables. Les membres « actifs » sont visibles sur le site, triés par ordre d'affichage."
      endpoint="/api/admin/officials"
      listKey="officials"
      itemKey="official"
      newLabel="Nouveau membre"
      allowDelete
      deleteMode="soft"
      reorderEndpoint="/api/admin/officials/reorder"
      rowLabel={(r) => `« ${String(r.full_name ?? "ce membre")} »`}
      fields={[
        {
          name: "category",
          label: "Catégorie",
          type: "select",
          options: [
            { value: "BUREAU", label: "Bureau exécutif" },
            { value: "DIRIGEANT", label: "Dirigeant" }
          ]
        },
        { name: "fullName", label: "Nom complet", required: true, rowKey: "full_name", placeholder: "Prénom Nom", fullWidth: true },
        { name: "position", label: "Fonction", required: true, placeholder: "Président, Trésorier, Responsable licences…", fullWidth: true },
        {
          name: "photoUrl",
          label: "Photo individuelle du membre (URL)",
          type: "url",
          rowKey: "photo_url",
          placeholder: "https://…",
          fullWidth: true,
          help: "Cette photo apparaît sur la fiche du membre et ne remplace pas la photo de couverture de la page. Format conseillé : portrait vertical 800 x 1000 px."
        },
        imageUploadField({ targetField: "photoUrl", folder: "direction", label: "…ou téléverser la photo du membre" }),
        { name: "orderIndex", label: "Ordre d'affichage", type: "number", rowKey: "order_index", help: "Petit nombre = affiché en premier (le Président en 0)." },
        { name: "isActive", label: "Actif (visible sur le site)", type: "boolean", rowKey: "is_active" }
      ]}
      columns={[
        { label: "Nom", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.full_name ?? "—")}</span> },
        {
          label: "Photo",
          render: (r) =>
            r.photo_url ? (
              <img src={String(r.photo_url)} alt="" className="h-10 w-10 rounded-md object-cover ring-2 ring-[#f7c600]" />
            ) : (
              <span className="text-xs font-black uppercase text-slate-400">À ajouter</span>
            )
        },
        { label: "Fonction", render: (r) => String(r.position ?? "—") },
        { label: "Catégorie", render: (r) => (r.category === "BUREAU" ? "Bureau exécutif" : "Dirigeant") },
        { label: "Ordre", render: (r) => String(r.order_index ?? "—") },
        { label: "Actif", render: (r) => (r.is_active ? <span className="font-black text-emerald-700">✓ Oui</span> : <span className="text-slate-400">Non</span>) }
      ]}
    />
  );
}
