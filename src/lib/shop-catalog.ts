import type { Product, ProductCategory, ProductVariant } from "@/lib/db/types";

export type ShopCatalogPayload = {
  categories: ProductCategory[];
  products: Product[];
  variants: ProductVariant[];
};

export type DisplayProduct = {
  id: string;
  variantId: string | null;
  name: string;
  description: string | null;
  price: string;
  category: string;
  imageUrl: string | null;
  stockQuantity: number | null;
};

function priceFr(cents: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency || "EUR"
  }).format(cents / 100);
}

export function buildShopCatalog(payload: ShopCatalogPayload): DisplayProduct[] {
  const categories = new Map(payload.categories.map((category) => [category.id, category.name]));
  const variants = new Map<string, ProductVariant>();

  for (const variant of payload.variants) {
    if (!variants.has(variant.product_id)) {
      variants.set(variant.product_id, variant);
    }
  }

  return payload.products.map((product) => {
    const variant = variants.get(product.id) ?? null;
    const priceCents = product.price_cents + (variant?.price_delta_cents ?? 0);

    return {
      id: product.id,
      variantId: variant?.id ?? null,
      name: product.name,
      description: product.description,
      price: priceFr(priceCents, product.currency),
      category: (product.category_id && categories.get(product.category_id)) || "Boutique",
      imageUrl: product.image_url,
      stockQuantity: variant?.stock_quantity ?? null
    };
  });
}
