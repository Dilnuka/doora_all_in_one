import { prisma } from "@doora/database";
import { toPublicUser } from "./users";

export async function getOrCreateDirectConversation(userId: string, otherUserId: string) {
  const existing = await prisma.conversation.findFirst({
    where: {
      type: "direct",
      AND: [
        { members: { some: { userId } } },
        { members: { some: { userId: otherUserId } } },
      ],
    },
    select: { id: true },
  });

  if (existing) return existing.id;

  const conversation = await prisma.conversation.create({
    data: {
      type: "direct",
      members: {
        create: [{ userId }, { userId: otherUserId }],
      },
    },
  });

  return conversation.id;
}

export async function getConversationParticipants(conversationId: string, excludeUserId: string) {
  const members = await prisma.conversationMember.findMany({
    where: { conversationId, NOT: { userId: excludeUserId } },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarColor: true,
          avatarId: true,
          status: true,
          statusMessage: true,
        },
      },
    },
  });

  return members.map((m) => toPublicUser(m.user));
}

export async function formatConversationForUser(
  conversationId: string,
  userId: string,
  base: { id: string; type: string; name: string | null; createdAt: Date },
) {
  const participants = await getConversationParticipants(conversationId, userId);

  const lastMessage = await prisma.message.findFirst({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    include: { sender: { select: { name: true } } },
  });

  const unreadCount = await prisma.message.count({
    where: {
      conversationId,
      NOT: { senderId: userId },
      reads: { none: { userId } },
    },
  });

  return {
    id: base.id,
    type: base.type,
    name: base.name || participants[0]?.displayName || "Chat",
    participants,
    lastMessage: lastMessage
      ? {
          id: lastMessage.id,
          content: lastMessage.content,
          senderId: lastMessage.senderId,
          senderName: lastMessage.sender.name,
          createdAt: lastMessage.createdAt.toISOString(),
        }
      : null,
    unreadCount,
    createdAt: base.createdAt.toISOString(),
  };
}
