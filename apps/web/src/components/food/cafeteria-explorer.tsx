"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Search, Star, Utensils } from "lucide-react";
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

export function CafeteriaExplorer({ cafeterias }: { cafeterias: CafeteriaCard[] }) {
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
    <div>
      <section className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-rose-500 to-amber-500 px-6 py-12 text-white shadow-xl shadow-orange-500/20 sm:px-10 sm:py-16">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-100">
            Doora Food
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            Order from cafeterias in your complex
          </h1>
          <p className="mt-4 text-base text-orange-50 sm:text-lg">
            Browse menus, track orders live, and get food delivered to your tower and apartment.
          </p>
        </div>
      </section>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
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
              onClick={() => setCuisine(item)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                cuisine === item
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <Utensils className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <p className="text-lg font-medium text-slate-700">No cafeterias found</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cafe) => (
            <Link
              key={cafe.id}
              href={`/food/cafeteria/${cafe.id}`}
              className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={cafe.imageUrl}
                  alt={cafe.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800">
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
                  <h3 className="font-semibold text-slate-900 group-hover:text-orange-600">
                    {cafe.name}
                  </h3>
                  <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
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
