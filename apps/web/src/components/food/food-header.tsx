import Link from "next/link";
import { auth } from "@/lib/auth";
import { CartButton } from "@/components/food/cart-button";
import { ClipboardList } from "lucide-react";

export async function FoodHeader() {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Food</h1>
        {role === "CAFETERIA" && (
          <Link href="/food/dashboard" className="text-xs text-orange-600 hover:underline">
            Open cafeteria dashboard →
          </Link>
        )}
      </div>
      <div className="flex items-center gap-3">
        {role === "RESIDENT" && (
          <>
            <Link
              href="/food/orders"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ClipboardList className="h-4 w-4" />
              My Orders
            </Link>
            <CartButton />
          </>
        )}
      </div>
    </header>
  );
}
