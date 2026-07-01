import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(import.meta.dirname, "../../../apps/web/.env.local") });

const { prisma } = await import("@doora/database");

const user = await prisma.user.findUnique({ where: { email: "resident@demo.com" } });
console.log(user ? `OK: ${user.email}` : "FAIL: user not found");
