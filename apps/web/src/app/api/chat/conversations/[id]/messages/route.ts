import { NextResponse } from "next/server";
import { prisma } from "@doora/database";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const member = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: { conversationId: id, userId: session.user.id },
    },
  });
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 100);
  const before = url.searchParams.get("before");

  const messages = await prisma.message.findMany({
    where: {
      conversationId: id,
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    include: {
      sender: {
        select: { name: true, avatarColor: true, avatarId: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const formatted = messages.reverse().map((m) => ({
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    senderName: m.sender.name,
    senderAvatarColor: m.sender.avatarColor,
    senderAvatarId: m.sender.avatarId,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    isOwn: m.senderId === session.user.id,
  }));

  return NextResponse.json({ messages: formatted });
}
