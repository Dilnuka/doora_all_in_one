"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";
import type { Role } from "@doora/database";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/food", label: "Food", icon: UtensilsCrossed },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/room", label: "Room", icon: Zap },
  { href: "/doora", label: "Doora AI", icon: Bot },
];

type SidebarProps = {
  user: {
    name?: string | null;
    email?: string | null;
    role: Role;
  };
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col bg-doora-navy text-slate-200">
      <div className="border-b border-doora-navy-light px-5 py-5">
        <p className="text-lg font-semibold text-white">Doora</p>
        <p className="text-xs text-slate-400">Unified Platform</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-doora-orange text-white shadow-sm"
                  : "text-slate-300 hover:bg-doora-navy-light hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname.startsWith("/admin")
                ? "bg-doora-orange text-white shadow-sm"
                : "text-slate-300 hover:bg-doora-navy-light hover:text-white",
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Admin
          </Link>
        )}
      </nav>

      <div className="border-t border-doora-navy-light p-4">
        <div className="mb-3 truncate">
          <p className="text-sm font-medium text-white">{user.name}</p>
          <p className="truncate text-xs text-slate-400">{user.email}</p>
          <p className="mt-1 text-xs text-doora-orange">{user.role}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-doora-navy-light hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
