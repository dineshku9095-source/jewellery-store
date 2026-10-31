"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface CartItem {
  variantId: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  unitPrice: string;
  quantity: number;
  imageUrl?: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
  subtotal: string;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "jewellery_cart_v1";

function computeSubtotal(items: CartItem[]): string {
  return items
    .reduce((acc, item) => acc + parseFloat(item.unitPrice) * item.quantity, 0)
    .toFixed(2);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem: (item) => {
        setItems((prev) => {
          const existing = prev.find((p) => p.variantId === item.variantId);
          if (existing) {
            return prev.map((p) =>
              p.variantId === item.variantId
                ? { ...p, quantity: p.quantity + (item.quantity ?? 1) }
                : p
            );
          }
          return [...prev, { ...item, quantity: item.quantity ?? 1 }];
        });
      },
      updateQuantity: (variantId, quantity) => {
        if (quantity < 1) {
          setItems((prev) => prev.filter((p) => p.variantId !== variantId));
          return;
        }
        setItems((prev) =>
          prev.map((p) => (p.variantId === variantId ? { ...p, quantity } : p))
        );
      },
      removeItem: (variantId) =>
        setItems((prev) => prev.filter((p) => p.variantId !== variantId)),
      clear: () => setItems([]),
      subtotal: computeSubtotal(items),
      count: items.reduce((n, i) => n + i.quantity, 0),
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
