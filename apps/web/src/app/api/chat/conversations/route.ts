import { NextResponse } from "next/server";
import { prisma } from "@doora/database";
import { auth } from "@/lib/auth";
import {
  formatConversationForUser,
  getConversationParticipants,
  getOrCreateDirectConversation,
} from "@/lib/chat/conversations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberships = await prisma.conversationMember.findMany({
    where: { userId: session.user.id },
    include: { conversation: true },
    orderBy: { conversation: { createdAt: "desc" } },
  });

  const conversations = await Promise.all(
    memberships.map((m) =>
      formatConversationForUser(m.conversationId, session.user.id, m.conversation),
    ),
  );

  conversations.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt || a.createdAt;
    const bTime = b.lastMessage?.createdAt || b.createdAt;
    return bTime.localeCompare(aTime);
  });

  return NextResponse.json({ conversations });
}
