"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  variantId: string | null;
  name: string;
  price: string | null;
  imageUrl: string | null;
  maxQuantity: number;
  quantity: number;
};

export type CartProductInput = {
  productId: string;
  variantId?: string | null;
  name: string;
  price?: string | null;
  imageUrl?: string | null;
  maxQuantity?: number;
};

type ShopContextValue = {
  items: CartItem[];
  count: number;
  addItem: (product: CartProductInput) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);
const STORAGE_KEY = "esviry-cart-v2";
const MAX_QUANTITY = 20;

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Restaure le panier depuis le localStorage au montage (persiste entre visites).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Hydratation unique au montage depuis localStorage : lecture impossible au rendu SSR
          // (sinon mismatch d'hydratation). C'est l'usage legitime de setState dans un effect.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setItems(
            parsed
              .filter(
                (item): item is CartItem =>
                  Boolean(item) &&
                  typeof item.productId === "string" &&
                  typeof item.name === "string" &&
                  typeof item.quantity === "number"
              )
              .map((item) => ({
                productId: item.productId,
                variantId: typeof item.variantId === "string" ? item.variantId : null,
                name: item.name,
                price: typeof item.price === "string" ? item.price : null,
                imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : null,
                maxQuantity: Math.min(
                  MAX_QUANTITY,
                  Math.max(1, typeof item.maxQuantity === "number" ? Math.trunc(item.maxQuantity) : MAX_QUANTITY)
                ),
                quantity: Math.min(
                  MAX_QUANTITY,
                  Math.max(1, Math.trunc(item.quantity)),
                  Math.max(1, typeof item.maxQuantity === "number" ? Math.trunc(item.maxQuantity) : MAX_QUANTITY)
                )
              }))
          );
        }
      }
    } catch {
      // localStorage corrompu ou indisponible : on démarre avec un panier vide.
    }
    setHydrated(true);
  }, []);

  // Persiste à chaque changement (après l'hydratation pour ne pas écraser le stockage).
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // quota dépassé ou stockage indisponible : sans conséquence fonctionnelle.
    }
  }, [items, hydrated]);

  const value = useMemo<ShopContextValue>(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      addItem: (product) =>
        setItems((current) => {
          const maxQuantity = Math.min(MAX_QUANTITY, Math.max(1, product.maxQuantity ?? MAX_QUANTITY));
          const existing = current.find((item) => item.productId === product.productId);
          if (existing) {
            return current.map((item) =>
              item.productId === product.productId
                ? { ...item, maxQuantity, quantity: Math.min(maxQuantity, item.quantity + 1) }
                : item
            );
          }
          return [
            ...current,
            {
              productId: product.productId,
              variantId: product.variantId ?? null,
              name: product.name,
              price: product.price ?? null,
              imageUrl: product.imageUrl ?? null,
              maxQuantity,
              quantity: 1
            }
          ];
        }),
      removeItem: (productId) => setItems((current) => current.filter((item) => item.productId !== productId)),
      setQuantity: (productId, quantity) =>
        setItems((current) =>
          quantity <= 0
            ? current.filter((item) => item.productId !== productId)
            : current.map((item) =>
                item.productId === productId ? { ...item, quantity: Math.min(item.maxQuantity, MAX_QUANTITY, quantity) } : item
              )
        ),
      clear: () => setItems([])
    }),
    [items]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopContextValue {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop doit être utilisé dans un ShopProvider.");
  }
  return context;
}
