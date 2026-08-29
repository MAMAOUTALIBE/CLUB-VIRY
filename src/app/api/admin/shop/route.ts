import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, parseLimit } from "@/lib/api/http";
import { listShopForAdmin } from "@/lib/db/recruitment-shop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "shop:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 100, 500);

  try {
    const shop = await listShopForAdmin(limit);
    const productNames = new Map(shop.products.map((product) => [product.id, product.name]));
    return jsonOk({
      ...shop,
      variants: shop.variants.map((variant) => ({
        ...variant,
        product_name: productNames.get(variant.product_id) ?? "Produit archivé"
      }))
    });
  } catch (error) {
    return handleDbError("admin/shop", error);
  }
}
