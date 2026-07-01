"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  menuItemId: string;
  cafeteriaId: string;
  cafeteriaName: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getCafeteriaId: () => string | null;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existingCafeteria = get().getCafeteriaId();
        if (existingCafeteria && existingCafeteria !== item.cafeteriaId) {
          if (
            !confirm(
              "Your cart has items from another cafeteria. Clear cart and add this item?",
            )
          ) {
            return;
          }
          set({ items: [] });
        }

        set((state) => {
          const existing = state.items.find((i) => i.menuItemId === item.menuItemId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.menuItemId === item.menuItemId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },
      removeItem: (menuItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.menuItemId !== menuItemId),
        })),
      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i,
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
      getCafeteriaId: () => get().items[0]?.cafeteriaId ?? null,
    }),
    { name: "doora-platform-food-cart" },
  ),
);

export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
