"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CreditCard, Loader2, MapPin, Package } from "lucide-react";
import { createOrder } from "@/actions/food/orders";
import { useCartHydrated, useCartStore } from "@/store/food/cart";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function CheckoutForm({
  defaultTower,
  defaultApartment,
}: {
  defaultTower?: string | null;
  defaultApartment?: string | null;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotal = useCartStore((s) => s.getTotal);
  const { showToast } = useToast();
  const [deliveryType, setDeliveryType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [tower, setTower] = useState(defaultTower ?? "");
  const [apartment, setApartment] = useState(defaultApartment ?? "");
  const [note, setNote] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [pending, startTransition] = useTransition();

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" />
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <Button className="mt-6" onClick={() => router.push("/food")}>
          Browse Cafeterias
        </Button>
      </div>
    );
  }

  const cafeteriaId = items[0].cafeteriaId;
  const total = getTotal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (deliveryType === "DELIVERY" && (!tower || !apartment)) {
      showToast("Please enter tower and apartment for delivery", "error");
      return;
    }

    if (cardNumber.replace(/\s/g, "").length < 12) {
      showToast("Please enter a valid card number (simulated)", "error");
      return;
    }

    startTransition(async () => {
      try {
        const order = await createOrder({
          cafeteriaId,
          deliveryType,
          tower: deliveryType === "DELIVERY" ? tower : undefined,
          apartment: deliveryType === "DELIVERY" ? apartment : undefined,
          note,
          total,
          items: items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        });
        clearCart();
        showToast("Payment successful! Order placed.");
        router.push(`/food/orders?highlight=${order.id}`);
      } catch {
        showToast("Failed to place order. Please try again.", "error");
      }
    });
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
      <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-500" />
              Delivery Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              {(["DELIVERY", "PICKUP"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDeliveryType(type)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    deliveryType === type
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  {type === "DELIVERY" ? "Deliver to apartment" : "Pickup at cafeteria"}
                </button>
              ))}
            </div>

            {deliveryType === "DELIVERY" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tower">Tower</Label>
                  <Input
                    id="tower"
                    value={tower}
                    onChange={(e) => setTower(e.target.value)}
                    placeholder="e.g. B"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apartment">Apartment</Label>
                  <Input
                    id="apartment"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    placeholder="e.g. 1204"
                    required
                  />
                </div>
              </div>
            ) : (
              <p className="rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-800">
                Pick up from {items[0].cafeteriaName} when ready.
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="note">Special instructions (optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Gate code, allergies, etc."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-500" />
              Payment (Simulated)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">Demo checkout — enter any card number.</p>
            <div className="space-y-2">
              <Label htmlFor="card">Card number</Label>
              <Input
                id="card"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Processing..." : `Pay ${formatCurrency(total)} & Place Order`}
        </Button>
      </form>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <p className="text-sm text-slate-500">{items[0].cafeteriaName}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.menuItemId} className="flex justify-between text-sm">
              <span className="text-slate-600">
                {item.quantity}x {item.name}
              </span>
              <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-slate-200 pt-3">
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="text-orange-600">{formatCurrency(total)}</span>
            </div>
          </div>
          {session?.user?.name && (
            <p className="text-xs text-slate-400">Ordering as {session.user.name}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
