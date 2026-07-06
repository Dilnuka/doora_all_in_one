import { notFound } from "next/navigation";
import { prisma } from "@doora/database";
import { CafeteriaMenu } from "@/components/food/cafeteria-menu";

export const dynamic = "force-dynamic";

export default async function CafeteriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cafeteria = await prisma.cafeteria.findUnique({
    where: { id },
    include: {
      menuItems: { orderBy: [{ category: "asc" }, { name: "asc" }] },
    },
  });

  if (!cafeteria) notFound();

  return <CafeteriaMenu cafeteria={cafeteria} />;
}
