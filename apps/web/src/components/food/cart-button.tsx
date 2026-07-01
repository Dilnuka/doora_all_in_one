"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useCartHydrated, useCartStore } from "@/store/food/cart";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function CartButton() {
  const [open, setOpen] = useState(false);
  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getTotal = useCartStore((s) => s.getTotal);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const count = hydrated ? getItemCount() : 0;

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const drawer = (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/40"
      onClick={() => setOpen(false)}
    >
      <div
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Your Cart</h2>
          <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
              <ShoppingCart className="mb-3 h-12 w-12 opacity-30" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex gap-3 rounded-xl border border-slate-100 p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-orange-600">{formatCurrency(item.price)}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.menuItemId)}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-slate-200 p-5">
            <div className="mb-4 flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span className="text-orange-600">{formatCurrency(getTotal())}</span>
            </div>
            <Link href="/food/checkout" onClick={() => setOpen(false)}>
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        aria-label="Open cart"
      >
        <ShoppingCart className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>
      {hydrated && open && createPortal(drawer, document.body)}
    </>
  );
}
