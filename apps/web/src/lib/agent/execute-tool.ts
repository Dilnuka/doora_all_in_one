import { prisma } from "@doora/database";
import type { Prisma } from "@doora/database";
import { getOrCreateDirectConversation } from "@/lib/chat/conversations";
import { toPublicUser } from "@/lib/chat/users";
import {
  DEFAULT_ROOM_STATE,
  parsePersistedRoomSnapshot,
  type RoomState,
} from "@/lib/room/room-state";
import type { ToolCallResult } from "./tools";

type AgentUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
  roomId: string | null;
  tower: string | null;
  apartment: string | null;
};

export async function buildAgentContext(user: AgentUser) {
  const parts: string[] = [
    `User: ${user.name} (${user.role})`,
    user.tower ? `Tower ${user.tower}, Apt ${user.apartment}` : "",
  ].filter(Boolean);

  if (user.roomId) {
    const room = await prisma.room.findUnique({
      where: { id: user.roomId },
      select: { code: true, name: true, state: true },
    });
    if (room) {
      const snap = parsePersistedRoomSnapshot(room.state);
      const rs = snap?.roomState ?? DEFAULT_ROOM_STATE;
      parts.push(
        `Room: ${room.name} (${room.code})`,
        `Lights master: ${rs.lights.master}, AC: ${rs.ac.isOn ? rs.ac.temp + "°C" : "off"}, TV: ${rs.tv}, Door: ${rs.doorLocked ? "locked" : "unlocked"}`,
      );
    }
  }

  const contacts = await prisma.contact.findMany({
    where: { userId: user.id },
    take: 8,
    include: {
      contact: {
        select: { name: true, username: true, status: true },
      },
    },
  });
  if (contacts.length) {
    parts.push(
      "Contacts: " +
        contacts
          .map((c) => `${c.contact.name} (@${c.contact.username}, ${c.contact.status})`)
          .join("; "),
    );
  }

  if (user.role === "RESIDENT") {
    const lastOrder = await prisma.order.findFirst({
      where: { residentId: user.id },
      orderBy: { createdAt: "desc" },
      include: { cafeteria: { select: { name: true } } },
    });
    if (lastOrder) {
      parts.push(
        `Latest food order: ${lastOrder.status} from ${lastOrder.cafeteria.name} (₹${lastOrder.total})`,
      );
    }
  }

  const routines = await prisma.smartRoutine.findMany({
    where: { userId: user.id },
    select: { triggerPhrase: true, actions: true },
  });
  if (routines.length) {
    parts.push(`Smart routines: ${JSON.stringify(routines)}`);
  }

  return parts.join("\n");
}

async function updateRoomState(user: AgentUser, updater: (state: RoomState) => RoomState) {
  if (!user.roomId) {
    return { success: false, error: "No room assigned to this account" };
  }
  const room = await prisma.room.findUnique({
    where: { id: user.roomId },
    select: { state: true },
  });
  const snap = parsePersistedRoomSnapshot(room?.state);
  const current = snap?.roomState ?? DEFAULT_ROOM_STATE;
  const next = updater(current);
  const payload = {
    roomState: next,
    serviceQueue: snap?.serviceQueue ?? [],
    logs: snap?.logs ?? [],
    updatedAt: new Date().toISOString(),
  };
  await prisma.room.update({
    where: { id: user.roomId },
    data: { state: payload },
  });
  return { success: true, roomState: next };
}

export async function executeAgentTool(
  name: string,
  args: Record<string, unknown>,
  user: AgentUser,
): Promise<ToolCallResult> {
  const start = Date.now();
  try {
    let result: unknown;

    switch (name) {
      case "set_light": {
        const zone = String(args.zone);
        const state = Boolean(args.state);
        result = await updateRoomState(user, (rs) => {
          const lights = { ...rs.lights };
          if (zone === "all" || zone === "master") {
            Object.keys(lights).forEach((k) => {
              lights[k as keyof typeof lights] = state;
            });
          } else if (zone in lights) {
            lights[zone as keyof typeof lights] = state;
          }
          return { ...rs, lights };
        });
        break;
      }
      case "set_temperature": {
        const temp = Number(args.temp);
        result = await updateRoomState(user, (rs) => ({
          ...rs,
          ac: { isOn: true, temp },
        }));
        break;
      }
      case "set_ac_power": {
        const state = Boolean(args.state);
        result = await updateRoomState(user, (rs) => ({
          ...rs,
          ac: { ...rs.ac, isOn: state },
        }));
        break;
      }
      case "set_tv": {
        result = await updateRoomState(user, (rs) => ({ ...rs, tv: Boolean(args.state) }));
        break;
      }
      case "set_curtains": {
        const zone = String(args.zone);
        const state = Boolean(args.state);
        result = await updateRoomState(user, (rs) => {
          const curtains = { ...rs.curtains };
          if (zone === "all") {
            curtains.living = state;
            curtains.bed = state;
          } else if (zone in curtains) {
            curtains[zone as keyof typeof curtains] = state;
          }
          return { ...rs, curtains };
        });
        break;
      }
      case "set_door": {
        result = await updateRoomState(user, (rs) => ({
          ...rs,
          doorLocked: Boolean(args.state),
        }));
        break;
      }
      case "make_coffee": {
        result = await updateRoomState(user, (rs) => ({ ...rs, coffeeMaker: true }));
        break;
      }
      case "search_menu": {
        const q = String(args.query ?? "").trim();
        const items = await prisma.menuItem.findMany({
          where: {
            isAvailable: true,
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { category: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          },
          include: { cafeteria: { select: { name: true } } },
          take: 8,
        });
        result = items.map((i) => ({
          name: i.name,
          price: i.price,
          cafeteria: i.cafeteria.name,
          id: i.id,
        }));
        break;
      }
      case "place_food_order": {
        if (user.role !== "RESIDENT") {
          return { name, args, success: false, error: "Only residents can place food orders" };
        }
        const items = (args.items as { name: string; quantity: number }[]) ?? [];
        if (!items.length) {
          return { name, args, success: false, error: "No items specified" };
        }
        const names = items.map((i) => i.name.toLowerCase());
        const menuItems = await prisma.menuItem.findMany({
          where: {
            isAvailable: true,
            OR: names.map((n) => ({ name: { contains: n, mode: "insensitive" as const } })),
          },
          include: { cafeteria: true },
        });
        if (!menuItems.length) {
          return { name, args, success: false, error: "No matching menu items found" };
        }
        const cafeteriaId = menuItems[0].cafeteriaId;
        const lineItems = items
          .map((req) => {
            const match = menuItems.find((m) =>
              m.name.toLowerCase().includes(req.name.toLowerCase()),
            );
            if (!match || match.cafeteriaId !== cafeteriaId) return null;
            return {
              menuItemId: match.id,
              name: match.name,
              price: match.price,
              quantity: Math.max(1, req.quantity),
            };
          })
          .filter(Boolean) as {
          menuItemId: string;
          name: string;
          price: number;
          quantity: number;
        }[];
        if (!lineItems.length) {
          return { name, args, success: false, error: "Could not match items from one cafeteria" };
        }
        const total = lineItems.reduce((s, i) => s + i.price * i.quantity, 0);
        const order = await prisma.order.create({
          data: {
            residentId: user.id,
            cafeteriaId,
            total,
            tower: user.tower,
            apartment: user.apartment,
            note: args.note ? String(args.note) : null,
            items: { create: lineItems },
          },
        });
        result = { orderId: order.id, status: order.status, total };
        break;
      }
      case "get_order_status": {
        const order = await prisma.order.findFirst({
          where: { residentId: user.id },
          orderBy: { createdAt: "desc" },
          include: { cafeteria: { select: { name: true } }, items: true },
        });
        result = order
          ? {
              status: order.status,
              cafeteria: order.cafeteria.name,
              total: order.total,
              items: order.items.map((i) => `${i.quantity}x ${i.name}`),
            }
          : { message: "No orders found" };
        break;
      }
      case "search_contacts": {
        const q = String(args.query ?? "").trim();
        const users = await prisma.user.findMany({
          where: {
            NOT: { id: user.id },
            OR: [
              { username: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
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
          take: 10,
        });
        result = users.map(toPublicUser);
        break;
      }
      case "send_message": {
        const username = String(args.username ?? "").replace(/^@/, "");
        const content = String(args.content ?? "").trim();
        const target = await prisma.user.findFirst({
          where: { username: { equals: username, mode: "insensitive" } },
        });
        if (!target) {
          return { name, args, success: false, error: "User not found" };
        }
        const convId = await getOrCreateDirectConversation(user.id, target.id);
        const message = await prisma.message.create({
          data: { conversationId: convId, senderId: user.id, content },
        });
        result = { messageId: message.id, to: target.name, conversationId: convId };
        break;
      }
      case "get_online_contacts": {
        const contacts = await prisma.contact.findMany({
          where: { userId: user.id, contact: { status: "online" } },
          include: {
            contact: {
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
        result = contacts.map((c) => toPublicUser(c.contact));
        break;
      }
      default:
        return { name, args, success: false, error: `Unknown tool: ${name}` };
    }

    const failed =
      result &&
      typeof result === "object" &&
      "success" in result &&
      (result as { success: boolean }).success === false;

    await prisma.agentActionLog.create({
      data: {
        userId: user.id,
        toolName: name,
        toolArgs: args as Prisma.InputJsonValue,
        status: failed ? "error" : "success",
        result: (result ?? null) as Prisma.InputJsonValue,
        durationMs: Date.now() - start,
      },
    });

    if (failed && result && typeof result === "object" && "error" in result) {
      return { name, args, success: false, error: String((result as { error: string }).error) };
    }

    return { name, args, success: true, result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tool execution failed";
    await prisma.agentActionLog.create({
      data: {
        userId: user.id,
        toolName: name,
        toolArgs: args as Prisma.InputJsonValue,
        status: "error",
        errorMessage: message,
        durationMs: Date.now() - start,
      },
    });
    return { name, args, success: false, error: message };
  }
}

export function routineToToolCalls(actions: Record<string, string | number>) {
  const tools: { name: string; args: Record<string, unknown> }[] = [];
  for (const [key, val] of Object.entries(actions)) {
    if (key === "tv") tools.push({ name: "set_tv", args: { state: val === "on" } });
    if (key === "door") tools.push({ name: "set_door", args: { state: val === "lock" } });
    if (key === "ac_power") tools.push({ name: "set_ac_power", args: { state: val === "on" } });
    if (key === "ac_temp") tools.push({ name: "set_temperature", args: { temp: Number(val) } });
    if (key.startsWith("light_"))
      tools.push({ name: "set_light", args: { zone: key.split("_")[1], state: val === "on" } });
    if (key.startsWith("curtains_"))
      tools.push({
        name: "set_curtains",
        args: { zone: key.split("_")[1], state: val === "open" },
      });
  }
  return tools;
}
