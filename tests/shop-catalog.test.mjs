import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { buildShopCatalog } from "../src/lib/shop-catalog.ts";

const now = "2026-08-29T10:00:00.000Z";

function product(overrides = {}) {
  return {
    id: "10000000-0000-4000-8000-000000000001",
    category_id: "20000000-0000-4000-8000-000000000001",
    name: "Pass Famille+",
    slug: "pass-famille-plus",
    description: "Saison 2026 / 2027",
    image_url: "/club-logo.svg",
    status: "ACTIVE",
    price_cents: 5900,
    currency: "EUR",
    order_index: 0,
    created_at: now,
    updated_at: now,
    ...overrides
  };
}

function variant(overrides = {}) {
  return {
    id: "30000000-0000-4000-8000-000000000001",
    product_id: "10000000-0000-4000-8000-000000000001",
    label: "Saison 2026 / 2027",
    sku: "PASS-FAMILLE-2026-2027",
    stock_quantity: 100,
    price_delta_cents: 0,
    is_active: true,
    created_at: now,
    updated_at: now,
    ...overrides
  };
}

test("le catalogue public conserve les identifiants, le prix, la catégorie et le stock CRM", () => {
  const result = buildShopCatalog({
    categories: [
      {
        id: "20000000-0000-4000-8000-000000000001",
        name: "Pass club",
        slug: "pass-club",
        order_index: 0,
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ],
    products: [product()],
    variants: [variant()]
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].id, "10000000-0000-4000-8000-000000000001");
  assert.equal(result[0].variantId, "30000000-0000-4000-8000-000000000001");
  assert.equal(result[0].category, "Pass club");
  assert.equal(result[0].stockQuantity, 100);
  assert.match(result[0].price, /59,00/);
});

test("le catalogue utilise le supplément CRM et ne fabrique pas de stock sans variante", () => {
  const withVariant = buildShopCatalog({ categories: [], products: [product()], variants: [variant({ price_delta_cents: 500 })] });
  const withoutVariant = buildShopCatalog({ categories: [], products: [product()], variants: [] });

  assert.match(withVariant[0].price, /64,00/);
  assert.equal(withoutVariant[0].stockQuantity, null);
  assert.equal(withoutVariant[0].variantId, null);
});

test("la migration lance exactement les deux pass sans écraser les modifications CRM", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20260829120000_launch_support_passes.sql", import.meta.url), "utf8");

  assert.match(sql, /'Pass Famille\+'.*5900/s);
  assert.match(sql, /'Pass Supporter'.*2900/s);
  assert.match(sql, /'PASS-FAMILLE-2026-2027', 100/);
  assert.match(sql, /'PASS-SUPPORTER-2026-2027', 150/);
  assert.match(sql, /on conflict \(slug\) do nothing/i);
  assert.match(sql, /create_shop_order_atomic/);
  assert.match(sql, /for update/i);
});

test("une annulation CRM restitue le stock et une réouverture le réserve", async () => {
  const sql = await readFile(
    new URL("../supabase/migrations/20260829123000_restore_cancelled_shop_stock.sql", import.meta.url),
    "utf8"
  );

  assert.match(sql, /new\.status in \('CANCELLED', 'REFUNDED'\)/);
  assert.match(sql, /stock_quantity = variant\.stock_quantity \+ ordered\.quantity/);
  assert.match(sql, /old\.status in \('CANCELLED', 'REFUNDED'\).*new\.status not in/s);
  assert.match(sql, /SHOP_INSUFFICIENT_STOCK/);
  assert.match(sql, /before update of status on public\.orders/);
});
