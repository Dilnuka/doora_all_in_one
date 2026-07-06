"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Search, Star, Utensils } from "lucide-react";
import { FoodImage } from "@/components/food/food-image";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";

export type CafeteriaCard = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  cuisine: string;
  rating: number;
  isOpen: boolean;
  _count: { menuItems: number };
};

export type PopularItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  cafeteriaId: string;
  cafeteriaName: string;
};

export function CafeteriaExplorer({
  cafeterias,
  popularItems = [],
}: {
  cafeterias: CafeteriaCard[];
  popularItems?: PopularItem[];
}) {
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("All");

  const cuisines = useMemo(
    () => ["All", ...new Set(cafeterias.map((c) => c.cuisine))],
    [cafeterias],
  );

  const filtered = useMemo(() => {
    return cafeterias.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.cuisine.toLowerCase().includes(search.toLowerCase());
      const matchesCuisine = cuisine === "All" || c.cuisine === cuisine;
      return matchesSearch && matchesCuisine;
    });
  }, [cafeterias, search, cuisine]);

  return (
    <div className="min-w-0 max-w-full">
      <section className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-doora-navy via-doora-navy-light to-doora-orange px-6 py-12 text-white shadow-xl shadow-doora-navy/20 sm:px-10 sm:py-14">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-doora-orange/20 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-doora-orange-soft">
            Doora Food
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            Order from cafeterias in your complex
          </h1>
          <p className="mt-4 text-base text-slate-200 sm:text-lg">
            Browse menus, track orders live, and get food delivered to your tower and apartment.
          </p>
        </div>
      </section>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cafeterias or cuisines..."
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {cuisines.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCuisine(item)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                cuisine === item
                  ? "bg-doora-orange text-white shadow-md shadow-doora-orange/25"
                  : "bg-doora-surface-card text-doora-navy ring-1 ring-doora-border hover:bg-doora-surface",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {popularItems.length > 0 && (
        <section className="mb-10 min-w-0">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-doora-navy">Popular dishes</h2>
            <span className="shrink-0 text-sm text-slate-500">Across all cafeterias</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {popularItems.map((item) => (
              <Link
                key={item.id}
                href={`/food/cafeteria/${item.cafeteriaId}`}
                className="group flex w-[260px] shrink-0 gap-3 rounded-2xl border border-doora-border bg-doora-surface-card p-3 shadow-sm transition hover:border-doora-orange/40 hover:shadow-md sm:w-[280px]"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <FoodImage
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover transition group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-doora-navy group-hover:text-doora-orange">
                    {item.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">{item.cafeteriaName}</p>
                  <p className="mt-1 text-sm font-semibold text-doora-orange">
                    {formatCurrency(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-doora-navy">
          Cafeterias
          <span className="ml-2 text-sm font-normal text-slate-500">({filtered.length})</span>
        </h2>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-doora-border bg-doora-surface-card py-16 text-center">
          <Utensils className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <p className="text-lg font-medium text-doora-navy">No cafeterias found</p>
          <p className="mt-1 text-sm text-slate-500">Try a different search or cuisine filter.</p>
        </div>
      ) : (
        <div className="grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((cafe) => (
            <Link
              key={cafe.id}
              href={`/food/cafeteria/${cafe.id}`}
              className="group min-w-0 overflow-hidden rounded-2xl border border-doora-border bg-doora-surface-card shadow-sm transition hover:-translate-y-0.5 hover:border-doora-orange/30 hover:shadow-lg"
            >
              <div className="relative h-44 overflow-hidden">
                <FoodImage
                  src={cafe.imageUrl}
                  alt={cafe.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-doora-navy">
                  {cafe.cuisine}
                </div>
                {!cafe.isOpen && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                    Closed
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-doora-navy group-hover:text-doora-orange">
                    {cafe.name}
                  </h3>
                  <span className="flex shrink-0 items-center gap-1 rounded-lg bg-doora-orange-soft px-2 py-1 text-xs font-semibold text-doora-orange-dark">
                    <Star className="h-3.5 w-3.5 fill-doora-orange text-doora-orange" />
                    {cafe.rating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">{cafe.description}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Utensils className="h-3.5 w-3.5" />
                    {cafe._count.menuItems} items
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    20-30 min
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-slate-400">
        Delivery fee included · {formatCurrency(0)} platform fee
      </p>
    </div>
  );
}
