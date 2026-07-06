import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { createDatabasePool } from "../src/pg-pool";
import { FOOD_CAFETERIAS } from "../src/food-seed-data";

const pool = createDatabasePool();
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const cafe of FOOD_CAFETERIAS) {
    const existing = await prisma.cafeteria.findFirst({
      where: { name: cafe.name },
    });

    const cafeteria = existing
      ? await prisma.cafeteria.update({
          where: { id: existing.id },
          data: {
            description: cafe.description,
            imageUrl: cafe.imageUrl,
            cuisine: cafe.cuisine,
            rating: cafe.rating,
            isOpen: cafe.isOpen,
          },
        })
      : await prisma.cafeteria.create({
          data: {
            name: cafe.name,
            description: cafe.description,
            imageUrl: cafe.imageUrl,
            cuisine: cafe.cuisine,
            rating: cafe.rating,
            isOpen: cafe.isOpen,
          },
        });

    await prisma.menuItem.deleteMany({ where: { cafeteriaId: cafeteria.id } });
    await prisma.menuItem.createMany({
      data: cafe.menuItems.map((item) => ({
        ...item,
        cafeteriaId: cafeteria.id,
        isAvailable: true,
      })),
    });

    console.log(`  ${cafe.name}: ${cafe.menuItems.length} menu items`);
  }

  const total = await prisma.menuItem.count();
  const cafes = await prisma.cafeteria.count();
  console.log(`\nFood seed complete — ${cafes} cafeterias, ${total} menu items.`);
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
