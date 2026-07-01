import { NextResponse } from "next/server";
import { prisma } from "@doora/database";
import { auth } from "@/lib/auth";

const DEFAULT_ROUTINES = [
  {
    triggerPhrase: "Good Morning",
    actions: {
      light_master: "on",
      curtains_living: "open",
      curtains_bed: "open",
      ac_power: "on",
      ac_temp: 24,
    },
  },
  {
    triggerPhrase: "Good Night",
    actions: {
      light_master: "off",
      curtains_living: "close",
      curtains_bed: "close",
      door: "lock",
      ac_power: "on",
      ac_temp: 22,
    },
  },
  {
    triggerPhrase: "Movie Time",
    actions: {
      light_master: "off",
      curtains_living: "close",
      tv: "on",
    },
  },
];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let routines = await prisma.smartRoutine.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  if (routines.length === 0) {
    await prisma.smartRoutine.createMany({
      data: DEFAULT_ROUTINES.map((r) => ({
        userId: session.user.id,
        triggerPhrase: r.triggerPhrase,
        actions: r.actions,
      })),
    });
    routines = await prisma.smartRoutine.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    });
  }

  return NextResponse.json({ routines });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { triggerPhrase, actions } = await request.json();
  if (!triggerPhrase || !actions) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const routine = await prisma.smartRoutine.create({
    data: {
      userId: session.user.id,
      triggerPhrase,
      actions,
    },
  });

  return NextResponse.json({ routine }, { status: 201 });
}
