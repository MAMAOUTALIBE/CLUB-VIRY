"use client";

import { AdminCrud } from "@/components/admin/AdminCrud";

export function PartnersAdmin() {
  return (
    <AdminCrud
      title="Partenaires"
      description="Gérez les partenaires et sponsors du club. Les partenaires « actifs » apparaissent sur la page /partenaires du site."
      endpoint="/api/admin/partners"
      listKey="partners"
      itemKey="partner"
      newLabel="Nouveau partenaire"
      fields={[
        { name: "name", label: "Nom", required: true, fullWidth: true, placeholder: "Intersport" },
        { name: "tier", label: "Niveau (Or / Argent / Bronze…)", placeholder: "Or" },
        { name: "logoUrl", label: "Logo (URL)", type: "url", rowKey: "logo_url", placeholder: "https://…" },
        { name: "websiteUrl", label: "Site web (URL)", type: "url", rowKey: "website_url", placeholder: "https://…" },
        { name: "orderIndex", label: "Ordre d'affichage", type: "number", rowKey: "order_index", help: "Petit nombre = affiché en premier." },
        { name: "isActive", label: "Actif (visible sur le site)", type: "boolean", rowKey: "is_active" },
        { name: "description", label: "Description", type: "textarea" }
      ]}
      columns={[
        { label: "Nom", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.name ?? "—")}</span> },
        { label: "Niveau", render: (r) => String(r.tier ?? "—") },
        { label: "Ordre", render: (r) => String(r.order_index ?? "—") },
        { label: "Actif", render: (r) => (r.is_active ? <span className="font-black text-emerald-700">✓ Oui</span> : <span className="text-slate-400">Non</span>) }
      ]}
    />
  );
}
