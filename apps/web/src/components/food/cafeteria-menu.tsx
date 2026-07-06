"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Plus, Star } from "lucide-react";
import { FoodImage } from "@/components/food/food-image";
import { useCartStore } from "@/store/food/cart";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
};

type Cafeteria = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rating: number;
  cuisine: string;
  isOpen: boolean;
  menuItems: MenuItem[];
};

export function CafeteriaMenu({ cafeteria }: { cafeteria: Cafeteria }) {
  const addItem = useCartStore((s) => s.addItem);
  const { showToast } = useToast();

  const categories = Array.from(new Set(cafeteria.menuItems.map((item) => item.category)));

  const handleAdd = (item: MenuItem) => {
    if (!item.isAvailable) return;
    addItem({
      menuItemId: item.id,
      cafeteriaId: cafeteria.id,
      cafeteriaName: cafeteria.name,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
    });
    showToast(`${item.name} added to cart`);
  };

  return (
    <div>
      <Link
        href="/food"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-doora-orange"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to cafeterias
      </Link>

      <div className="relative mb-8 overflow-hidden rounded-3xl">
        <div className="relative h-56 sm:h-72">
          <Image
            src={cafeteria.imageUrl}
            alt={cafeteria.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
                {cafeteria.cuisine}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
                <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                {cafeteria.rating.toFixed(1)}
              </span>
              {!cafeteria.isOpen && (
                <span className="rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold">
                  Currently Closed
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{cafeteria.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/90 sm:text-base">
              {cafeteria.description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {categories.map((category) => (
          <section key={category}>
            <h2 className="mb-4 text-xl font-semibold text-doora-navy">{category}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cafeteria.menuItems
                .filter((item) => item.category === category)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-2xl border border-doora-border bg-doora-surface-card p-4 shadow-sm transition hover:border-doora-orange/30 hover:shadow-md"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                      <FoodImage
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <h3 className="font-semibold text-doora-navy">{item.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.description}</p>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <span className="font-semibold text-doora-orange">
                          {formatCurrency(item.price)}
                        </span>
                        <Button
                          size="sm"
                          disabled={!item.isAvailable || !cafeteria.isOpen}
                          onClick={() => handleAdd(item)}
                        >
                          <Plus className="h-4 w-4" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
