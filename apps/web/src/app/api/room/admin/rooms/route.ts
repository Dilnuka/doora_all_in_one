import { NextResponse } from "next/server";
import { prisma } from "@doora/database";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const rooms = await prisma.room.findMany({
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  });

  return NextResponse.json({ rooms });
}
