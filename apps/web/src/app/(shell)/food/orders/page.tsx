import { Suspense } from "react";
import { prisma } from "@doora/database";
import { auth } from "@/lib/auth";
import { OrdersList } from "@/components/food/orders-list";

async function OrdersData() {
  const session = await auth();
  const orders = await prisma.order.findMany({
    where: { residentId: session!.user.id },
    include: {
      cafeteria: { select: { name: true, imageUrl: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
  }));

  return <OrdersList initialOrders={serialized} />;
}

export default function FoodOrdersPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-slate-900">My Orders</h2>
      <Suspense fallback={<p className="text-slate-500">Loading orders...</p>}>
        <OrdersData />
      </Suspense>
    </div>
  );
}
