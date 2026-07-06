import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { createDatabasePool } from "../src/pg-pool";
import { FOOD_CAFETERIAS } from "../src/food-seed-data";

const pool = createDatabasePool();
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.agentMessage.deleteMany();
  await prisma.agentConversation.deleteMany();
  await prisma.agentActionLog.deleteMany();
  await prisma.messageRead.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.smartRoutine.deleteMany();
  await prisma.user.deleteMany();
  await prisma.room.deleteMany();
  await prisma.cafeteria.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);
  const guestHash = await bcrypt.hash("guest123", 10);
  const adminHash = await bcrypt.hash("admin123", 10);

  const guestRoom = await prisma.room.create({
    data: { code: "GUEST-ROOM", name: "Guest Suite 204" },
  });

  const adminRoom = await prisma.room.create({
    data: { code: "ADMIN-ROOM", name: "Admin Suite" },
  });

  const spiceRoute = FOOD_CAFETERIAS[0];

  const cafeteria = await prisma.cafeteria.create({
    data: {
      name: spiceRoute.name,
      description: spiceRoute.description,
      imageUrl: spiceRoute.imageUrl,
      cuisine: spiceRoute.cuisine,
      rating: spiceRoute.rating,
      isOpen: spiceRoute.isOpen,
      menuItems: { create: spiceRoute.menuItems },
    },
  });

  for (const cafe of FOOD_CAFETERIAS.slice(1)) {
    await prisma.cafeteria.create({
      data: {
        name: cafe.name,
        description: cafe.description,
        imageUrl: cafe.imageUrl,
        cuisine: cafe.cuisine,
        rating: cafe.rating,
        isOpen: cafe.isOpen,
        menuItems: { create: cafe.menuItems },
      },
    });
  }

  const resident = await prisma.user.create({
    data: {
      name: "Demo Resident",
      email: "resident@demo.com",
      passwordHash,
      role: "RESIDENT",
      tower: "B",
      apartment: "1204",
      username: "resident",
      avatarId: "p01",
    },
  });

  const cafeManager = await prisma.user.create({
    data: {
      name: "Cafe Manager",
      email: "cafe@demo.com",
      passwordHash,
      role: "CAFETERIA",
      cafeteriaId: cafeteria.id,
      username: "cafe_mgr",
      avatarId: "p05",
    },
  });

  await prisma.user.create({
    data: {
      name: "Room Guest",
      email: "guest@doora.local",
      passwordHash: guestHash,
      role: "GUEST",
      roomId: guestRoom.id,
      username: "guest",
      avatarId: "p03",
    },
  });

  await prisma.user.create({
    data: {
      name: "Platform Admin",
      email: "admin@doora.local",
      passwordHash: adminHash,
      role: "ADMIN",
      roomId: adminRoom.id,
      username: "admin",
      avatarId: "p02",
    },
  });

  // Chat demo contacts (mutual for testing)
  await prisma.contact.createMany({
    data: [
      { userId: resident.id, contactId: cafeManager.id },
      { userId: cafeManager.id, contactId: resident.id },
    ],
  });

  console.log("Doora Platform seed complete.");
  console.log("  resident@demo.com / password123 (Resident)");
  console.log("  cafe@demo.com / password123 (Cafeteria)");
  console.log("  guest@doora.local / guest123 (Guest + room)");
  console.log("  admin@doora.local / admin123 (Admin)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
