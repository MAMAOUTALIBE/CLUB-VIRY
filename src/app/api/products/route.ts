import { handleDbError, jsonOk } from "@/lib/api/http";
import { products as fallbackProducts } from "@/lib/data";
import { listPublicProducts, type PublicProductsPayload } from "@/lib/db/recruitment-shop";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getFallbackProducts(): PublicProductsPayload {
  const categoryNames = Array.from(new Set(fallbackProducts.map((product) => product.category)));
  const categories = categoryNames.map((name, index) => ({
    id: `fallback-category-${slugify(name)}`,
    name,
    slug: slugify(name),
    order_index: index,
    is_active: true,
    created_at: "",
    updated_at: ""
  }));

  return {
    categories,
    products: fallbackProducts.map((product, index) => {
      const category = categories.find((item) => item.name === product.category);
      return {
        id: `fallback-product-${slugify(product.name)}`,
        category_id: category?.id ?? null,
        name: product.name,
        slug: slugify(product.name),
        description: null,
        image_url: null,
        status: "ACTIVE",
        price_cents: Math.round(Number(product.price.replace(",", ".").replace(/[^\d.]/g, "")) * 100),
        currency: "EUR",
        order_index: index,
        created_at: "",
        updated_at: ""
      };
    }),
    variants: []
  };
}

export async function GET() {
  if (!isSupabaseAdminConfigured) {
    return jsonOk(getFallbackProducts());
  }

  try {
    const products = await listPublicProducts();
    return jsonOk(products);
  } catch (error) {
    return handleDbError("products", error);
  }
}
