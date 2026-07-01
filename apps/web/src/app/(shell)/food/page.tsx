import { redirect } from "next/navigation";
import { prisma } from "@doora/database";
import { auth } from "@/lib/auth";
import { CafeteriaExplorer } from "@/components/food/cafeteria-explorer";

export default async function FoodPage() {
  const session = await auth();

  if (session?.user.role === "CAFETERIA") {
    redirect("/food/dashboard");
  }

  const cafeterias = await prisma.cafeteria.findMany({
    include: { _count: { select: { menuItems: true } } },
    orderBy: { rating: "desc" },
  });

  return <CafeteriaExplorer cafeterias={cafeterias} />;
}
