import { redirect } from "next/navigation";
import { prisma } from "@doora/database";
import { auth } from "@/lib/auth";
import { CafeteriaExplorer } from "@/components/food/cafeteria-explorer";

export const dynamic = "force-dynamic";

export default async function FoodPage() {
  const session = await auth();

  if (session?.user.role === "CAFETERIA") {
    redirect("/food/dashboard");
  }

  const [cafeterias, popularItems] = await Promise.all([
    prisma.cafeteria.findMany({
      include: { _count: { select: { menuItems: true } } },
      orderBy: { rating: "desc" },
    }),
    prisma.menuItem.findMany({
      where: { isAvailable: true, cafeteria: { isOpen: true } },
      include: { cafeteria: { select: { id: true, name: true } } },
      orderBy: { price: "desc" },
      take: 8,
    }),
  ]);

  return (
    <CafeteriaExplorer
      cafeterias={cafeterias}
      popularItems={popularItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        category: item.category,
        cafeteriaId: item.cafeteria.id,
        cafeteriaName: item.cafeteria.name,
      }))}
    />
  );
}
