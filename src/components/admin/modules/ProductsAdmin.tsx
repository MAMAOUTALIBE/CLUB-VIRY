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
    <div className="grid gap-6">
      <AdminCrud
        title="Boutique — Produits"
        description="Gérez les articles de la boutique. Les produits « En vente » apparaissent immédiatement sur la page /boutique du site."
        listEndpoint="/api/admin/shop"
        endpoint="/api/admin/shop/products"
        viewsScope="products"
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

      <AdminCrud
        title="Boutique — Stocks"
        description="Modifiez les quantités disponibles. Une commande enregistrée décompte automatiquement le stock."
        listEndpoint="/api/admin/shop"
        endpoint="/api/admin/shop/variants"
        listKey="variants"
        itemKey="variant"
        disableCreate
        fields={[
          { name: "label", label: "Libellé", required: true, fullWidth: true },
          { name: "sku", label: "Référence (SKU)" },
          { name: "stockQuantity", label: "Quantité disponible", type: "number", required: true, rowKey: "stock_quantity" },
          {
            name: "priceDelta",
            label: "Supplément de prix (€)",
            payloadKey: "priceDeltaCents",
            toPayload: (v) => Math.round(parseFloat(v.replace(",", ".").trim()) * 100),
            fromRowValue: (r) => (typeof r.price_delta_cents === "number" ? (r.price_delta_cents / 100).toString() : "0")
          },
          { name: "isActive", label: "Stock actif", type: "boolean", rowKey: "is_active" }
        ]}
        columns={[
          { label: "Produit", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.product_name ?? "—")}</span> },
          { label: "Libellé", render: (r) => String(r.label ?? "—") },
          { label: "Référence", render: (r) => String(r.sku ?? "—") },
          { label: "Disponible", render: (r) => <span className="font-black">{String(r.stock_quantity ?? 0)}</span> },
          { label: "État", render: (r) => (r.is_active ? "Actif" : "Inactif") }
        ]}
      />
    </div>
  );
}
