import { Package, Shirt, ShoppingBag, Star } from "lucide-react";
import { FeatureCards } from "@/components/FeatureCards";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { ShopProvider } from "@/components/shop/ShopProvider";
import { images } from "@/lib/images";
import { getPublicProducts } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/boutique");
export const revalidate = 300; // ISR : contenu CMS rafraichi toutes les 5 min

export default async function ShopPage() {
  const products = await getPublicProducts();
  return (
    <ShopProvider>
      <PageHero description="Portez les couleurs de Viry : textile, accessoires et packs supporters." image={images.football} title="Boutique officielle" />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle
          title="Tous les produits"
          text="Ajoutez vos articles au panier, puis envoyez votre demande de commande au club (à régler et à retirer sur place)."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <article className="official-card flex flex-col rounded-lg bg-white p-6" key={product.name}>
                <div className="club-panel flex h-40 items-center justify-center overflow-hidden rounded-md text-[#f7c600]">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  ) : Icon ? (
                    <Icon size={70} aria-hidden="true" />
                  ) : (
                    <ShoppingBag size={70} aria-hidden="true" />
                  )}
                </div>
                <p className="mt-5 text-xs font-black uppercase text-[#664d00]">{product.category}</p>
                <h2 className="text-xl font-black uppercase text-[#002f1d]">{product.name}</h2>
                <p className="mt-2 text-lg font-black">{product.price}</p>
                <div className="mt-auto pt-4">
                  <AddToCartButton product={{ name: product.name, price: product.price, imageUrl: product.imageUrl }} />
                </div>
              </article>
            );
          })}
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
      <CartDrawer />
    </ShopProvider>
  );
}
