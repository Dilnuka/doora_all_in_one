"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@doora/database";
import type { DeliveryType, OrderStatus } from "@doora/database";

export type OrderInput = {
  cafeteriaId: string;
  deliveryType: DeliveryType;
  tower?: string;
  apartment?: string;
  note?: string;
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
};

const FOOD_PATHS = ["/food", "/food/orders", "/food/dashboard", "/food/dashboard/menu"];

function revalidateFood() {
  for (const path of FOOD_PATHS) {
    revalidatePath(path);
  }
}

export async function createOrder(input: OrderInput) {
  const session = await auth();
  if (!session?.user || session.user.role !== "RESIDENT") {
    throw new Error("Unauthorized");
  }

  if (!input.items?.length) throw new Error("Your cart is empty");

  const cafeteria = await prisma.cafeteria.findUnique({
    where: { id: input.cafeteriaId },
  });
  if (!cafeteria) throw new Error("Cafeteria not found");
  if (!cafeteria.isOpen) throw new Error("This cafeteria is currently closed");

  if (
    input.deliveryType === "DELIVERY" &&
    (!input.tower?.trim() || !input.apartment?.trim())
  ) {
    throw new Error("Tower and apartment are required for delivery");
  }

  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: input.items.map((i) => i.menuItemId) },
      cafeteriaId: input.cafeteriaId,
    },
  });
  const menuMap = new Map(menuItems.map((m) => [m.id, m]));

  const lineItems = input.items.map((item) => {
    const menuItem = menuMap.get(item.menuItemId);
    if (!menuItem) throw new Error("An item in your cart is no longer available");
    if (!menuItem.isAvailable) throw new Error(`${menuItem.name} is no longer available`);
    const quantity = Math.max(1, Math.floor(item.quantity));
    return {
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
    };
  });

  const total = lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await prisma.order.create({
    data: {
      residentId: session.user.id,
      cafeteriaId: input.cafeteriaId,
      total,
      deliveryType: input.deliveryType,
      tower: input.deliveryType === "DELIVERY" ? input.tower?.trim() : null,
      apartment: input.deliveryType === "DELIVERY" ? input.apartment?.trim() : null,
      note: input.note?.trim() || null,
      items: { create: lineItems },
    },
    include: { cafeteria: true, items: true },
  });

  revalidateFood();
  return order;
}

const STATUS_FLOW: Record<DeliveryType, OrderStatus[]> = {
  DELIVERY: ["PENDING", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"],
  PICKUP: ["PENDING", "PREPARING", "READY", "DELIVERED"],
};

export async function advanceOrderStatus(orderId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CAFETERIA") {
    throw new Error("Unauthorized");
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.cafeteriaId !== session.user.cafeteriaId) {
    throw new Error("Order not found");
  }

  const flow = STATUS_FLOW[order.deliveryType];
  const currentIndex = flow.indexOf(order.status);
  if (currentIndex === -1 || currentIndex >= flow.length - 1) return order;

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: flow[currentIndex + 1] },
  });

  revalidateFood();
  return updated;
}

export async function cancelOrder(orderId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  const isOwner =
    session.user.role === "RESIDENT" && order.residentId === session.user.id;
  const isCafeteria =
    session.user.role === "CAFETERIA" && order.cafeteriaId === session.user.cafeteriaId;

  if (!isOwner && !isCafeteria) throw new Error("Forbidden");
  if (!["PENDING", "PREPARING"].includes(order.status)) {
    throw new Error("Order cannot be cancelled at this stage");
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  revalidateFood();
  return updated;
}

export async function createMenuItem(data: {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}) {
  const session = await auth();
  if (!session?.user?.cafeteriaId) throw new Error("Unauthorized");

  const item = await prisma.menuItem.create({
    data: { ...data, cafeteriaId: session.user.cafeteriaId },
  });

  revalidateFood();
  revalidatePath(`/food/cafeteria/${session.user.cafeteriaId}`);
  return item;
}

export async function updateMenuItem(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    isAvailable: boolean;
  }>,
) {
  const session = await auth();
  if (!session?.user?.cafeteriaId) throw new Error("Unauthorized");

  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing || existing.cafeteriaId !== session.user.cafeteriaId) {
    throw new Error("Not found");
  }

  const item = await prisma.menuItem.update({ where: { id }, data });
  revalidateFood();
  revalidatePath(`/food/cafeteria/${session.user.cafeteriaId}`);
  return item;
}

export async function deleteMenuItem(id: string) {
  const session = await auth();
  if (!session?.user?.cafeteriaId) throw new Error("Unauthorized");

  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing || existing.cafeteriaId !== session.user.cafeteriaId) {
    throw new Error("Not found");
  }

  await prisma.menuItem.delete({ where: { id } });
  revalidateFood();
  revalidatePath(`/food/cafeteria/${session.user.cafeteriaId}`);
}
