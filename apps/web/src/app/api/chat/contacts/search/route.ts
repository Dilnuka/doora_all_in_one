import { NextResponse } from "next/server";
import { prisma } from "@doora/database";
import { auth } from "@/lib/auth";
import { toPublicUser } from "@/lib/chat/users";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      NOT: { id: session.user.id },
      OR: [
        { username: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      username: true,
      avatarColor: true,
      avatarId: true,
      status: true,
      statusMessage: true,
    },
    take: 20,
  });

  return NextResponse.json({ users: users.map(toPublicUser) });
}
