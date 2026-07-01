import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { prisma } from "@doora/database";
import { socketAuth } from "./auth.js";

const onlineUsers = new Map<string, string>();

function publicUser(user: {
  id: string;
  name: string;
  username: string | null;
  avatarColor: string;
  avatarId: string | null;
  status: string;
  statusMessage: string;
}) {
  return {
    id: user.id,
    username: user.username ?? user.id.slice(0, 8),
    displayName: user.name,
    avatarColor: user.avatarColor,
    avatarId: user.avatarId,
    status: user.status,
    statusMessage: user.statusMessage,
  };
}

export function setupSocket(server: HttpServer, allowedOrigins: string | string[]) {
  const origins = Array.isArray(allowedOrigins) ? allowedOrigins : [allowedOrigins];
  const io = new Server(server, {
    cors: { origin: origins, credentials: true },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    void (async () => {
      const userId = socket.data.userId as string;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          username: true,
          avatarColor: true,
          avatarId: true,
          status: true,
          statusMessage: true,
        },
      });

      if (!user) {
        socket.disconnect(true);
        return;
      }

      onlineUsers.set(userId, socket.id);
      await prisma.user.update({
        where: { id: userId },
        data: { status: "online" },
      });

      io.emit("user:status", {
        userId,
        status: "online",
        user: { ...publicUser(user), status: "online" },
      });

      socket.on("conversation:join", async ({ conversationId }) => {
        const member = await prisma.conversationMember.findUnique({
          where: {
            conversationId_userId: { conversationId, userId },
          },
        });
        if (member) socket.join(`conv:${conversationId}`);
      });

      socket.on("conversation:leave", ({ conversationId }) => {
        socket.leave(`conv:${conversationId}`);
      });

      socket.on("message:send", async ({ conversationId, content }) => {
        if (!content?.trim()) return;

        const member = await prisma.conversationMember.findUnique({
          where: {
            conversationId_userId: { conversationId, userId },
          },
        });
        if (!member) return;

        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            content: content.trim(),
          },
          include: {
            sender: {
              select: {
                name: true,
                avatarColor: true,
                avatarId: true,
              },
            },
          },
        });

        const payload = {
          id: message.id,
          conversationId,
          senderId: userId,
          senderName: message.sender.name,
          senderAvatarColor: message.sender.avatarColor,
          senderAvatarId: message.sender.avatarId,
          content: message.content,
          createdAt: message.createdAt.toISOString(),
        };

        io.to(`conv:${conversationId}`).emit("message:new", { message: payload });

        const others = await prisma.conversationMember.findMany({
          where: { conversationId, NOT: { userId } },
          select: { userId: true },
        });

        for (const m of others) {
          const socketId = onlineUsers.get(m.userId);
          if (socketId) {
            io.to(socketId).emit("conversation:updated", {
              conversationId,
              lastMessage: {
                id: message.id,
                content: message.content,
                senderId: userId,
                senderName: message.sender.name,
                createdAt: payload.createdAt,
              },
            });
          }
        }
      });

      socket.on("typing:start", ({ conversationId }) => {
        socket.to(`conv:${conversationId}`).emit("typing:start", {
          conversationId,
          userId,
          displayName: user.name,
        });
      });

      socket.on("typing:stop", ({ conversationId }) => {
        socket.to(`conv:${conversationId}`).emit("typing:stop", {
          conversationId,
          userId,
        });
      });

      function relayToUser(targetUserId: string, event: string, payload: unknown) {
        const socketId = onlineUsers.get(targetUserId);
        if (socketId) {
          io.to(socketId).emit(event, payload);
        }
      }

      socket.on(
        "call:invite",
        ({ conversationId, targetUserId, callType, callId }: {
          conversationId: string;
          targetUserId: string;
          callType: string;
          callId: string;
        }) => {
          relayToUser(targetUserId, "call:incoming", {
            callId,
            conversationId,
            callType,
            fromUserId: userId,
            fromName: user.name,
          });
        },
      );

      socket.on(
        "call:accept",
        ({ callId, targetUserId }: { callId: string; targetUserId: string }) => {
          relayToUser(targetUserId, "call:accepted", { callId, fromUserId: userId });
        },
      );

      socket.on(
        "call:reject",
        ({ callId, targetUserId }: { callId: string; targetUserId: string }) => {
          relayToUser(targetUserId, "call:rejected", { callId, fromUserId: userId });
        },
      );

      socket.on(
        "call:end",
        ({ callId, targetUserId }: { callId: string; targetUserId: string }) => {
          relayToUser(targetUserId, "call:ended", { callId, fromUserId: userId });
        },
      );

      socket.on(
        "call:offer",
        ({
          callId,
          targetUserId,
          offer,
        }: {
          callId: string;
          targetUserId: string;
          offer: unknown;
        }) => {
          relayToUser(targetUserId, "call:offer", { callId, fromUserId: userId, offer });
        },
      );

      socket.on(
        "call:answer",
        ({
          callId,
          targetUserId,
          answer,
        }: {
          callId: string;
          targetUserId: string;
          answer: unknown;
        }) => {
          relayToUser(targetUserId, "call:answer", { callId, fromUserId: userId, answer });
        },
      );

      socket.on(
        "call:ice-candidate",
        ({
          callId,
          targetUserId,
          candidate,
        }: {
          callId: string;
          targetUserId: string;
          candidate: unknown;
        }) => {
          relayToUser(targetUserId, "call:ice-candidate", {
            callId,
            fromUserId: userId,
            candidate,
          });
        },
      );

      socket.on("disconnect", async () => {
        if (onlineUsers.get(userId) === socket.id) {
          onlineUsers.delete(userId);
          await prisma.user.update({
            where: { id: userId },
            data: { status: "offline" },
          });
          io.emit("user:status", { userId, status: "offline" });
        }
      });
    })().catch((err) => {
      console.error("Socket setup failed:", err);
      socket.disconnect(true);
    });
  });

  return io;
}
