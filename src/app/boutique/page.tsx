import { Package, Shirt, ShoppingBag, Star } from "lucide-react";
import { FeatureCards } from "@/components/FeatureCards";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { products } from "@/lib/data";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/boutique");

export default function ShopPage() {
  return (
    <>
      <PageHero description="Portez les couleurs de Viry : textile, accessoires et packs supporters." image={images.football} title="Boutique officielle" />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle title="Tous les produits" text="Portez fièrement les couleurs de l'ES Viry-Châtillon." />
          <div className="mb-8 flex flex-wrap gap-2">
            {["Tout", "Textile", "Accessoires", "Packs"].map((item) => (
              <span className="rounded-full border border-[#002f1d]/15 bg-white px-3 py-2 text-xs font-black uppercase text-[#002f1d]" key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <article className="official-card rounded-lg bg-white p-6" key={product.name}>
                <div className="club-panel flex h-40 items-center justify-center rounded-md text-[#f7c600]">
                  <Icon size={70} aria-hidden="true" />
                </div>
                <p className="mt-5 text-xs font-black uppercase text-[#8a6d00]">{product.category}</p>
                <h2 className="text-xl font-black uppercase text-[#002f1d]">{product.name}</h2>
                <p className="mt-2 text-lg font-black">{product.price}</p>
                <button className="mt-4 cursor-not-allowed rounded-md border border-[#002f1d]/15 bg-[#fbfcf8] px-4 py-3 text-sm font-black uppercase text-slate-400" type="button" disabled aria-disabled="true">
                  Bientôt disponible
                </button>
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
    </>
  );
}
