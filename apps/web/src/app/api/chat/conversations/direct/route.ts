import { NextResponse } from "next/server";
import { prisma } from "@doora/database";
import { auth } from "@/lib/auth";
import {
  formatConversationForUser,
  getOrCreateDirectConversation,
} from "@/lib/chat/conversations";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId: otherUserId } = await request.json();
  if (!otherUserId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const other = await prisma.user.findUnique({ where: { id: otherUserId } });
  if (!other) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const conversationId = await getOrCreateDirectConversation(session.user.id, otherUserId);

  const conv = await prisma.conversation.findUniqueOrThrow({
    where: { id: conversationId },
  });

  const conversation = await formatConversationForUser(
    conversationId,
    session.user.id,
    conv,
  );

  return NextResponse.json({ conversation });
}
