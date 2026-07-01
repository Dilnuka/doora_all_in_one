import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma CLI (migrate, studio) uses direct connection. Runtime app uses pooled DATABASE_URL.
const cliUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: cliUrl,
  },
});
