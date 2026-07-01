import { auth } from "@/lib/auth";
import { prisma } from "@doora/database";
import {
  FoodDashboardMobileNav,
  FoodDashboardSidebar,
} from "@/components/food/dashboard-nav";

export default async function FoodDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const cafeteria = await prisma.cafeteria.findUnique({
    where: { id: session!.user.cafeteriaId! },
    select: { name: true },
  });

  return (
    <div className="lg:flex lg:gap-8">
      <FoodDashboardSidebar cafeteriaName={cafeteria?.name ?? "Cafeteria"} />
      <div className="min-w-0 flex-1">
        <FoodDashboardMobileNav />
        {children}
      </div>
    </div>
  );
}
