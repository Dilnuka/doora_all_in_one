"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { cancelOrder } from "@/actions/food/orders";
import { OrderStatusStepper } from "@/components/food/order-status-stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus, DeliveryType } from "@doora/database";

type Order = {
  id: string;
  status: OrderStatus;
  total: number;
  deliveryType: DeliveryType;
  tower: string | null;
  apartment: string | null;
  note: string | null;
  createdAt: string;
  cafeteria: { name: string; imageUrl: string };
  items: { name: string; price: number; quantity: number }[];
};

export function OrdersList({ initialOrders }: { initialOrders: Order[] }) {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const [orders, setOrders] = useState(initialOrders);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/food/orders");
        if (res.ok && active) setOrders(await res.json());
      } catch {
        // ignore
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
      const res = await fetch("/api/food/orders");
      if (res.ok) setOrders(await res.json());
    } finally {
      setCancellingId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
        <p className="text-lg font-medium text-slate-700">No orders yet</p>
        <p className="mt-1 text-sm text-slate-500">Browse cafeterias and place your first order</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card
          key={order.id}
          id={order.id}
          className={highlightId === order.id ? "ring-2 ring-orange-400 ring-offset-2" : undefined}
        >
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className="relative hidden h-14 w-14 shrink-0 overflow-hidden rounded-xl sm:block">
                <Image
                  src={order.cafeteria.imageUrl}
                  alt={order.cafeteria.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div>
                <CardTitle className="text-lg">{order.cafeteria.name}</CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(order.createdAt)} · #{order.id.slice(-6).toUpperCase()}
                </p>
                {order.deliveryType === "DELIVERY" && (
                  <p className="mt-1 text-sm text-slate-600">
                    Tower {order.tower}, Apt {order.apartment}
                  </p>
                )}
              </div>
            </div>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
              {formatCurrency(order.total)}
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            <OrderStatusStepper status={order.status} deliveryType={order.deliveryType} />
            <div className="rounded-xl bg-slate-50 p-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between py-1 text-sm text-slate-600">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            {["PENDING", "PREPARING"].includes(order.status) && (
              <Button
                variant="outline"
                size="sm"
                disabled={cancellingId === order.id}
                onClick={() => handleCancel(order.id)}
              >
                {cancellingId === order.id ? "Cancelling..." : "Cancel order"}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
