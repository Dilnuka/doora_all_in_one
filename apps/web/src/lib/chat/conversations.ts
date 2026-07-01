import { prisma, Prisma } from "@doora/database";
import type { PrismaClient } from "@doora/database";
import { toPublicUser } from "./users";

type DbClient = PrismaClient | Prisma.TransactionClient;

async function findDirectConversationId(
  userId: string,
  otherUserId: string,
  db: DbClient = prisma,
) {
  const membership = await db.conversationMember.findFirst({
    where: {
      userId,
      conversation: {
        type: "direct",
        members: { some: { userId: otherUserId } },
      },
    },
    select: { conversationId: true },
  });

  return membership?.conversationId ?? null;
}

export async function getOrCreateDirectConversation(userId: string, otherUserId: string) {
  if (userId === otherUserId) {
    throw new Error("Cannot create a conversation with yourself");
  }

  const existingId = await findDirectConversationId(userId, otherUserId);
  if (existingId) return existingId;

  try {
    const conversation = await prisma.$transaction(async (tx) => {
      const again = await findDirectConversationId(userId, otherUserId, tx);
      if (again) return { id: again };

      return tx.conversation.create({
        data: {
          type: "direct",
          members: {
            create: [{ userId }, { userId: otherUserId }],
          },
        },
        select: { id: true },
      });
    });

    return conversation.id;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const raced = await findDirectConversationId(userId, otherUserId);
      if (raced) return raced;
    }
    throw error;
  }
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
