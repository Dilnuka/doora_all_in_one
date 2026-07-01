import { prisma } from "@doora/database";
import { auth } from "@/lib/auth";
import { MenuManager } from "@/components/food/menu-manager";

export default async function FoodMenuPage() {
  const session = await auth();

  const items = await prisma.menuItem.findMany({
    where: { cafeteriaId: session!.user.cafeteriaId! },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-slate-900">Menu Management</h2>
      <MenuManager initialItems={items} />
    </div>
  );
}
