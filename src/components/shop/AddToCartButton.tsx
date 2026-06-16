"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";

import { useShop, type CartProductInput } from "@/components/shop/ShopProvider";

export function AddToCartButton({ product }: { product: CartProductInput }) {
  const { addItem } = useShop();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Ajouter ${product.name} au panier`}
      className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#002f1d] px-4 py-3 text-sm font-black uppercase text-white transition hover:bg-[#07542f]"
    >
      {added ? (
        <>
          <Check size={16} aria-hidden="true" /> Ajouté au panier
        </>
      ) : (
        <>
          <ShoppingBag size={16} aria-hidden="true" /> Ajouter au panier
        </>
      )}
    </button>
  );
}
