"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Store, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/food/dashboard", label: "Orders", icon: ClipboardList },
  { href: "/food/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
];

function isActive(pathname: string, href: string) {
  return href === "/food/dashboard"
    ? pathname === "/food/dashboard"
    : pathname.startsWith(href);
}

export function FoodDashboardSidebar({ cafeteriaName }: { cafeteriaName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-4 space-y-6">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 text-white">
            <Store className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{cafeteriaName}</p>
            <p className="text-xs text-slate-500">Cafeteria Console</p>
          </div>
        </div>
        <nav className="space-y-1">
          {LINKS.map((link) => {
            const Icon = link.icon;
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md"
                    : "text-slate-600 hover:bg-white hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export function FoodDashboardMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex gap-2 lg:hidden">
      {LINKS.map((link) => {
        const Icon = link.icon;
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition",
              active
                ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white"
                : "border border-slate-200 bg-white text-slate-600",
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
