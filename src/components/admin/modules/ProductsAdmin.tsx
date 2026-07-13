"use client";

import { AdminCrud, imageUploadField } from "@/components/admin/AdminCrud";

function euros(cents: unknown, currency: unknown): string {
  if (typeof cents !== "number") return "—";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: typeof currency === "string" ? currency : "EUR" }).format(cents / 100);
}

const STATUS = [
  { value: "DRAFT", label: "Brouillon (non visible)" },
  { value: "ACTIVE", label: "En vente (visible)" },
  { value: "ARCHIVED", label: "Archivé" }
];

export function ProductsAdmin() {
  return (
    <AdminCrud
      title="Boutique — Produits"
      description="Gérez les articles de la boutique. Les produits « En vente » apparaissent sur la page /boutique du site."
      listEndpoint="/api/admin/shop"
      endpoint="/api/admin/shop/products"
      listKey="products"
      itemKey="product"
      newLabel="Nouveau produit"
      allowDelete
      allowBulkDelete
      deleteMode="soft"
      reorderEndpoint="/api/admin/shop/products/reorder"
      rowLabel={(r) => `« ${String(r.name ?? "ce produit")} »`}
      fields={[
        { name: "name", label: "Nom du produit", required: true, fullWidth: true, placeholder: "Maillot domicile" },
        {
          name: "price",
          label: "Prix (€)",
          required: true,
          payloadKey: "priceCents",
          toPayload: (v) => Math.round(parseFloat(v.replace(",", ".").trim()) * 100),
          fromRowValue: (r) => (typeof r.price_cents === "number" ? (r.price_cents / 100).toString() : ""),
          placeholder: "45"
        },
        { name: "currency", label: "Devise", type: "select", options: [{ value: "EUR", label: "EUR (€)" }] },
        { name: "status", label: "Statut", type: "select", options: STATUS },
        { name: "imageUrl", label: "Image (URL)", type: "url", rowKey: "image_url", placeholder: "https://…" },
        imageUploadField({ targetField: "imageUrl", folder: "produits", label: "…ou téléverser l'image du produit" }),
        { name: "orderIndex", label: "Ordre d'affichage", type: "number", rowKey: "order_index" },
        { name: "description", label: "Description", type: "textarea" }
      ]}
      columns={[
        { label: "Produit", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.name ?? "—")}</span> },
        { label: "Prix", render: (r) => euros(r.price_cents, r.currency) },
        { label: "Statut", render: (r) => STATUS.find((s) => s.value === r.status)?.label ?? String(r.status ?? "—") }
      ]}
    />
  );
}
