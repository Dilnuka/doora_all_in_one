import { NextResponse } from "next/server";
import { prisma } from "@doora/database";
import { auth } from "@/lib/auth";

export async function POST(
  _request: Request,
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

  const unread = await prisma.message.findMany({
    where: {
      conversationId: id,
      NOT: { senderId: session.user.id },
      reads: { none: { userId: session.user.id } },
    },
    select: { id: true },
  });

  if (unread.length > 0) {
    await prisma.messageRead.createMany({
      data: unread.map((m) => ({
        messageId: m.id,
        userId: session.user.id,
      })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({ success: true, readCount: unread.length });
}
