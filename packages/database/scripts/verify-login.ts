import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { createDatabasePool } from "../src/pg-pool";

const pool = createDatabasePool();
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const user = await prisma.user.findUnique({ where: { email: "resident@demo.com" } });
if (!user) {
  console.log("USER_NOT_FOUND");
  process.exit(1);
}

const ok = await bcrypt.compare("password123", user.passwordHash);
console.log("USER", user.email, "PASSWORD_OK", ok);

await prisma.$disconnect();
await pool.end();
