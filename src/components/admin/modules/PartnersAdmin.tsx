"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { AdminCrud } from "@/components/admin/AdminCrud";
import { showToast } from "@/components/admin/Toast";

type PartnerRow = Record<string, unknown>;

function PartnerPublicationAction({ row, onDone }: { row: PartnerRow; onDone: () => Promise<void> }) {
  const [pending, setPending] = useState(false);
  const id = typeof row.id === "string" ? row.id : "";
  const name = String(row.name ?? "ce partenaire");
  const isOnline = row.is_active === true;
  const nextIsOnline = !isOnline;

  if (!id) return null;

  async function togglePublication() {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextIsOnline })
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        showToast(json?.error?.message ?? "Publication impossible.", "error");
        return;
      }
      await onDone();
      showToast(nextIsOnline ? "Partenaire mis en ligne." : "Partenaire masqué du site.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Erreur réseau.", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void togglePublication()}
      disabled={pending}
      aria-label={`${nextIsOnline ? "Mettre en ligne" : "Masquer"} ${name}`}
      className={`focus-ring inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-black uppercase disabled:cursor-wait disabled:opacity-70 ${
        isOnline
          ? "border-amber-200 text-amber-800 hover:bg-amber-50"
          : "border-[#002f1d]/20 bg-[#002f1d] text-white hover:bg-[#07542f]"
      }`}
    >
      {pending ? <Loader2 className="animate-spin" size={14} aria-hidden="true" /> : isOnline ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
      {isOnline ? "Masquer" : "Mettre en ligne"}
    </button>
  );
}

export function PartnersAdmin() {
  return (
    <AdminCrud
      title="Partenaires"
      description="Gérez les partenaires et sponsors du club. Les partenaires « actifs » apparaissent sur la page /partenaires du site."
      endpoint="/api/admin/partners"
      listKey="partners"
      itemKey="partner"
      newLabel="Nouveau partenaire"
      allowDelete
      deleteMode="soft"
      reorderEndpoint="/api/admin/partners/reorder"
      rowLabel={(r) => `« ${String(r.name ?? "ce partenaire")} »`}
      rowActions={(row, { reload }) => <PartnerPublicationAction row={row} onDone={reload} />}
      fields={[
        { name: "name", label: "Nom", required: true, fullWidth: true, placeholder: "Intersport" },
        { name: "tier", label: "Niveau (Or / Argent / Bronze…)", placeholder: "Or" },
        {
          name: "logoFile",
          label: "Téléverser un logo",
          type: "file",
          payloadKey: false,
          uploadEndpoint: "/api/admin/partners/logo",
          uploadTargetField: "logoUrl",
          uploadResponseKey: "logoUrl",
          accept: "image/jpeg,image/png,image/webp",
          maxBytes: 2 * 1024 * 1024,
          fullWidth: true,
          help: "Choisissez un fichier depuis votre ordinateur. Formats acceptés : JPEG, PNG ou WebP, 2 Mo max."
        },
        {
          name: "logoUrl",
          label: "Logo (URL générée ou chemin public)",
          rowKey: "logo_url",
          placeholder: "Rempli automatiquement après upload, ou /images/partners/intersport.png",
          fullWidth: true,
          help: "Après téléversement, vérifiez que ce champ est rempli puis enregistrez le partenaire."
        },
        { name: "websiteUrl", label: "Site web (URL)", type: "url", rowKey: "website_url", placeholder: "https://…" },
        { name: "orderIndex", label: "Ordre d'affichage", type: "number", rowKey: "order_index", help: "Petit nombre = affiché en premier." },
        { name: "isActive", label: "Publication sur le site", type: "boolean", rowKey: "is_active", help: "Oui = visible sur l'accueil et la page partenaires. Non = conservé dans le CRM, masqué du site." },
        { name: "description", label: "Description", type: "textarea" }
      ]}
      columns={[
        { label: "Nom", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.name ?? "—")}</span> },
        {
          label: "Logo",
          render: (r) =>
            r.logo_url ? (
              <img src={String(r.logo_url)} alt="" className="h-9 max-w-24 rounded-sm object-contain" />
            ) : (
              <span className="text-xs font-black uppercase text-slate-400">À ajouter</span>
            )
        },
        { label: "Niveau", render: (r) => String(r.tier ?? "—") },
        { label: "Ordre", render: (r) => String(r.order_index ?? "—") },
        {
          label: "Publication",
          render: (r) =>
            r.is_active ? (
              <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black uppercase text-emerald-700 ring-1 ring-emerald-200">En ligne</span>
            ) : (
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black uppercase text-slate-500 ring-1 ring-slate-200">Masqué</span>
            )
        }
      ]}
    />
  );
}
