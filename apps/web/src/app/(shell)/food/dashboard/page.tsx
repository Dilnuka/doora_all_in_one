import { prisma } from "@doora/database";
import { auth } from "@/lib/auth";
import { DashboardOrders } from "@/components/food/dashboard-orders";

export default async function FoodDashboardPage() {
  const session = await auth();

  const orders = await prisma.order.findMany({
    where: { cafeteriaId: session!.user.cafeteriaId! },
    include: {
      resident: { select: { name: true, tower: true, apartment: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-slate-900">Order Dashboard</h2>
      <DashboardOrders initialOrders={serialized} />
    </div>
  );
}
