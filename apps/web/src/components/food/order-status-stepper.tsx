import {
  Check,
  ChefHat,
  Package,
  Truck,
  Clock3,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@doora/database";

const STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: "PENDING", label: "Order Placed", icon: Clock3 },
  { status: "PREPARING", label: "Preparing", icon: ChefHat },
  { status: "READY", label: "Ready", icon: Package },
  { status: "OUT_FOR_DELIVERY", label: "On the Way", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: Check },
];

export function OrderStatusStepper({
  status,
  deliveryType,
}: {
  status: OrderStatus;
  deliveryType: "DELIVERY" | "PICKUP";
}) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
        <XCircle className="h-5 w-5" />
        Order cancelled
      </div>
    );
  }

  const steps =
    deliveryType === "PICKUP"
      ? STEPS.filter((s) => s.status !== "OUT_FOR_DELIVERY")
      : STEPS;

  const currentIndex = steps.findIndex((s) => s.status === status);

  return (
    <div className="flex items-center justify-between gap-1 overflow-x-auto py-2">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isComplete = index < currentIndex || status === "DELIVERED";
        const isCurrent = index === currentIndex && status !== "DELIVERED";
        const isDelivered = status === "DELIVERED" && index === steps.length - 1;

        return (
          <div key={step.status} className="flex min-w-[72px] flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {index > 0 && (
                <div
                  className={cn(
                    "h-0.5 flex-1",
                    isComplete || isCurrent ? "bg-orange-500" : "bg-slate-200",
                  )}
                />
              )}
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition",
                  isComplete || isDelivered
                    ? "border-orange-500 bg-orange-500 text-white"
                    : isCurrent
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-slate-200 bg-white text-slate-400",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1",
                    isComplete ? "bg-orange-500" : "bg-slate-200",
                  )}
                />
              )}
            </div>
            <p
              className={cn(
                "mt-2 text-center text-[10px] font-medium leading-tight sm:text-xs",
                isComplete || isCurrent || isDelivered ? "text-slate-800" : "text-slate-400",
              )}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
