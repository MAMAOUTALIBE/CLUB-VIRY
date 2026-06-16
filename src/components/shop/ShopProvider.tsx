"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  name: string;
  price: string | null;
  imageUrl: string | null;
  quantity: number;
};

export type CartProductInput = {
  name: string;
  price?: string | null;
  imageUrl?: string | null;
};

type ShopContextValue = {
  items: CartItem[];
  count: number;
  addItem: (product: CartProductInput) => void;
  removeItem: (name: string) => void;
  setQuantity: (name: string, quantity: number) => void;
  clear: () => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);
const STORAGE_KEY = "esviry-cart-v1";
const MAX_QUANTITY = 99;

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
              .filter((item): item is CartItem => Boolean(item) && typeof item.name === "string" && typeof item.quantity === "number")
              .map((item) => ({
                name: item.name,
                price: typeof item.price === "string" ? item.price : null,
                imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : null,
                quantity: Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(item.quantity)))
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
          const existing = current.find((item) => item.name === product.name);
          if (existing) {
            return current.map((item) =>
              item.name === product.name ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + 1) } : item
            );
          }
          return [...current, { name: product.name, price: product.price ?? null, imageUrl: product.imageUrl ?? null, quantity: 1 }];
        }),
      removeItem: (name) => setItems((current) => current.filter((item) => item.name !== name)),
      setQuantity: (name, quantity) =>
        setItems((current) =>
          quantity <= 0
            ? current.filter((item) => item.name !== name)
            : current.map((item) => (item.name === name ? { ...item, quantity: Math.min(MAX_QUANTITY, quantity) } : item))
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
