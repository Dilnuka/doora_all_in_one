import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@doora/database";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "RESIDENT") {
    const orders = await prisma.order.findMany({
      where: { residentId: session.user.id },
      include: {
        cafeteria: { select: { name: true, imageUrl: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      orders.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() })),
    );
  }

  if (session.user.role === "CAFETERIA" && session.user.cafeteriaId) {
    const orders = await prisma.order.findMany({
      where: { cafeteriaId: session.user.cafeteriaId },
      include: {
        resident: { select: { name: true, tower: true, apartment: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      orders.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() })),
    );
  }

  return NextResponse.json([]);
}
