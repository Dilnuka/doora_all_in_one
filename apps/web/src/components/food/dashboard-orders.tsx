"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Bell,
  ChefHat,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { advanceOrderStatus, cancelOrder } from "@/actions/food/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus, DeliveryType } from "@doora/database";

type DashboardOrder = {
  id: string;
  status: OrderStatus;
  total: number;
  deliveryType: DeliveryType;
  tower: string | null;
  apartment: string | null;
  note: string | null;
  createdAt: string;
  resident: { name: string; tower: string | null; apartment: string | null };
  items: { name: string; quantity: number; price: number }[];
};

const NEXT_STATUS_LABEL: Record<string, string> = {
  PENDING: "Start Preparing",
  PREPARING: "Mark Ready",
  READY_DELIVERY: "Out for Delivery",
  READY_PICKUP: "Mark Picked Up",
  OUT_FOR_DELIVERY: "Mark Delivered",
};

function getNextLabel(status: OrderStatus, deliveryType: DeliveryType) {
  if (status === "READY") {
    return deliveryType === "PICKUP"
      ? NEXT_STATUS_LABEL.READY_PICKUP
      : NEXT_STATUS_LABEL.READY_DELIVERY;
  }
  return NEXT_STATUS_LABEL[status];
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PREPARING: "bg-blue-100 text-blue-700",
  READY: "bg-doora-orange-soft text-doora-navy-light",
  OUT_FOR_DELIVERY: "bg-sky-100 text-sky-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-600",
};

const FILTERS = [
  { id: "ALL", label: "All Active" },
  { id: "PENDING", label: "New" },
  { id: "PREPARING", label: "Preparing" },
  { id: "READY", label: "Ready" },
  { id: "OUT_FOR_DELIVERY", label: "On the Way" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

export function DashboardOrders({ initialOrders }: { initialOrders: DashboardOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<FilterId>("ALL");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/food/orders");
        if (res.ok && active) setOrders(await res.json());
      } catch {
        // Ignore transient fetch failures (navigation, server restart, offline)
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const refreshOrders = async () => {
    try {
      const res = await fetch("/api/food/orders");
      if (res.ok) setOrders(await res.json());
    } catch {
      // Ignore transient fetch failures
    }
  };

  const activeOrders = useMemo(
    () => orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)),
    [orders],
  );
  const completedOrders = useMemo(
    () => orders.filter((o) => ["DELIVERED", "CANCELLED"].includes(o.status)),
    [orders],
  );

  const stats = useMemo(() => {
    const newCount = orders.filter((o) => o.status === "PENDING").length;
    const inProgress = orders.filter((o) =>
      ["PREPARING", "READY", "OUT_FOR_DELIVERY"].includes(o.status),
    ).length;
    const completedToday = orders.filter(
      (o) => o.status === "DELIVERED" && isToday(o.createdAt),
    ).length;
    const revenueToday = orders
      .filter((o) => o.status !== "CANCELLED" && isToday(o.createdAt))
      .reduce((sum, o) => sum + o.total, 0);
    return { newCount, inProgress, completedToday, revenueToday };
  }, [orders]);

  const filteredActive = useMemo(() => {
    if (filter === "ALL") return activeOrders;
    return activeOrders.filter((o) => o.status === filter);
  }, [activeOrders, filter]);

  const countFor = (id: FilterId) =>
    id === "ALL"
      ? activeOrders.length
      : activeOrders.filter((o) => o.status === id).length;

  const handleAdvance = (orderId: string) => {
    startTransition(async () => {
      await advanceOrderStatus(orderId);
      await refreshOrders();
    });
  };

  const handleCancel = (orderId: string) => {
    startTransition(async () => {
      await cancelOrder(orderId);
      await refreshOrders();
    });
  };

  const statCards = [
    {
      label: "New Orders",
      value: stats.newCount,
      icon: Bell,
      accent: "bg-amber-100 text-amber-600",
      hint: stats.newCount > 0 ? "Needs attention" : "All caught up",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: ChefHat,
      accent: "bg-blue-100 text-blue-600",
      hint: "Being prepared / delivered",
    },
    {
      label: "Completed Today",
      value: stats.completedToday,
      icon: CheckCircle2,
      accent: "bg-emerald-100 text-emerald-600",
      hint: "Delivered orders",
    },
    {
      label: "Today's Revenue",
      value: formatCurrency(stats.revenueToday),
      icon: IndianRupee,
      accent: "bg-orange-100 text-orange-600",
      hint: "Excludes cancellations",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="overflow-hidden">
              <CardContent className="flex items-center gap-4 p-5">
                <span
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                    card.accent,
                  )}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                  <p className="text-sm font-medium text-slate-600">{card.label}</p>
                  <p className="truncate text-xs text-slate-400">{card.hint}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => {
            const count = countFor(f.id);
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs font-semibold",
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {filteredActive.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
              <ShoppingBag className="mb-3 h-12 w-12 text-slate-300" />
              <p className="font-medium text-slate-700">No orders here</p>
              <p className="mt-1 text-sm">
                {filter === "ALL"
                  ? "New orders will appear automatically."
                  : "Try a different filter."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredActive.map((order) => (
              <Card
                key={order.id}
                className={cn(
                  "border-l-4 transition",
                  order.status === "PENDING"
                    ? "border-l-amber-500"
                    : "border-l-orange-400",
                )}
              >
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {order.resident.name}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {formatDate(order.createdAt)} · #
                        {order.id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        STATUS_STYLES[order.status],
                      )}
                    >
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    {order.deliveryType === "DELIVERY" ? (
                      <>
                        <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
                        Tower {order.tower ?? order.resident.tower}, Apt{" "}
                        {order.apartment ?? order.resident.apartment}
                      </>
                    ) : (
                      <>
                        <Package className="h-4 w-4 shrink-0 text-orange-500" />
                        Pickup at cafeteria
                      </>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-100 p-3 text-sm">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between py-0.5">
                        <span className="text-slate-600">
                          <span className="font-medium text-slate-900">
                            {item.quantity}x
                          </span>{" "}
                          {item.name}
                        </span>
                        <span className="text-slate-500">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
                      <span>Total</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>

                  {order.note && (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      Note: {order.note}
                    </p>
                  )}

                  <div className="flex gap-2 pt-1">
                    {getNextLabel(order.status, order.deliveryType) && (
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={pending}
                        onClick={() => handleAdvance(order.id)}
                      >
                        {order.status === "OUT_FOR_DELIVERY" && (
                          <Truck className="h-4 w-4" />
                        )}
                        {getNextLabel(order.status, order.deliveryType)}
                      </Button>
                    )}
                    {["PENDING", "PREPARING"].includes(order.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() => handleCancel(order.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {completedOrders.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Recent Completed
          </h2>
          <div className="space-y-2">
            {completedOrders.slice(0, 6).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      STATUS_STYLES[order.status],
                    )}
                  >
                    {order.status}
                  </span>
                  <span className="text-slate-700">{order.resident.name}</span>
                </div>
                <span className="font-medium text-slate-900">
                  {formatCurrency(order.total)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
