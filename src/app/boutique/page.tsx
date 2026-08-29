import { Package, Shirt, ShoppingBag, Star } from "lucide-react";
import { FeatureCards } from "@/components/FeatureCards";
import { DesktopOnly, MobileScreen, MobileScrollableList } from "@/components/MobilePage";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { ShopProvider } from "@/components/shop/ShopProvider";
import { images } from "@/lib/images";
import { getPublicProducts } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/boutique");
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ShopPage() {
  const products = await getPublicProducts();
  return (
    <ShopProvider>
      <MobileScreen
        eyebrow="Boutique"
        title="Produits club"
        scrollable
      >
        <div className="grid grid-cols-2 gap-3 pb-2 lg:grid-cols-3">
          {products.map((product) => {
            return (
              <article className="flex min-h-0 flex-col rounded-lg border border-[#07542f]/12 bg-white p-3 shadow-sm" key={product.id}>
                <div className="club-panel aspect-square overflow-hidden rounded-md text-[#f7c600]">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-4" />
                  ) : (
                    <span className="flex h-full items-center justify-center">
                      <ShoppingBag size={42} aria-hidden="true" />
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[11px] font-black uppercase text-[#664d00]">{product.category}</p>
                <h2 className="mt-1 line-clamp-2 text-sm font-black uppercase leading-tight text-[#002f1d]">{product.name}</h2>
                <p className="mt-1 text-sm font-black text-slate-900">{product.price}</p>
                {product.stockQuantity !== null ? (
                  <p className="mt-1 text-[11px] font-bold text-slate-600">
                    {product.stockQuantity > 0 ? `${product.stockQuantity} disponible${product.stockQuantity > 1 ? "s" : ""}` : "Stock épuisé"}
                  </p>
                ) : null}
                <div className="mt-auto pt-2">
                  <AddToCartButton
                    product={{
                      productId: product.id,
                      variantId: product.variantId,
                      name: product.name,
                      price: product.price,
                      imageUrl: product.imageUrl,
                      maxQuantity: product.stockQuantity ?? undefined
                    }}
                  />
                </div>
              </article>
            );
          })}
          {products.length === 0 ? (
            <p className="col-span-2 rounded-lg border border-dashed border-[#07542f]/25 bg-white p-6 text-center text-sm font-bold text-slate-600 lg:col-span-3">
              Aucun produit n’est actuellement en vente.
            </p>
          ) : null}
        </div>
      </MobileScreen>
      <DesktopOnly>
      <PageHero description="Portez les couleurs de Viry : textile, accessoires et packs supporters." image={images.football} title="Boutique officielle" />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle
          title="Tous les produits"
          text="Ajoutez vos articles au panier, puis envoyez votre demande de commande au club (à régler et à retirer sur place)."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-6">
          {products.map((product) => {
            return (
              <article className="official-card flex flex-col rounded-lg bg-white p-6" key={product.id}>
                <div className="club-panel flex h-40 items-center justify-center overflow-hidden rounded-md text-[#f7c600]">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-5" />
                  ) : (
                    <ShoppingBag size={70} aria-hidden="true" />
                  )}
                </div>
                <p className="mt-5 text-xs font-black uppercase text-[#664d00]">{product.category}</p>
                <h2 className="text-xl font-black uppercase text-[#002f1d]">{product.name}</h2>
                <p className="mt-2 text-lg font-black">{product.price}</p>
                {product.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{product.description}</p> : null}
                {product.stockQuantity !== null ? (
                  <p className="mt-2 text-sm font-bold text-[#07542f]">
                    {product.stockQuantity > 0 ? `${product.stockQuantity} pass disponibles` : "Stock épuisé"}
                  </p>
                ) : null}
                <div className="mt-auto pt-4">
                  <AddToCartButton
                    product={{
                      productId: product.id,
                      variantId: product.variantId,
                      name: product.name,
                      price: product.price,
                      imageUrl: product.imageUrl,
                      maxQuantity: product.stockQuantity ?? undefined
                    }}
                  />
                </div>
              </article>
            );
          })}
          {products.length === 0 ? (
            <p className="col-span-full rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-bold text-slate-600">
              Aucun produit n’est actuellement en vente.
            </p>
          ) : null}
        </div>
      </section>
      <section className="club-shell px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle inverse eyebrow="Supporter" title="Porter Viry au quotidien" text="La boutique est une vitrine d'appartenance : joueurs, parents, éducateurs et supporters." />
          <FeatureCards
            inverse
            items={[
              { title: "Maillots", text: "Les couleurs du club sur le terrain et en tribune.", icon: Shirt },
              { title: "Packs", text: "Des ensembles pensés pour les familles et supporters.", icon: Package },
              { title: "Accessoires", text: "Des objets utiles pour afficher son attachement au club.", icon: ShoppingBag },
              { title: "Identité", text: "Une boutique qui renforce la fierté jaune et verte.", icon: Star }
            ]}
          />
        </div>
      </section>
      </DesktopOnly>
      <CartDrawer />
    </ShopProvider>
  );
}
