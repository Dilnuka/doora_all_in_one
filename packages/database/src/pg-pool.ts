import { Pool, type PoolConfig } from "pg";

export function createDatabasePool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const config: PoolConfig = { connectionString };

  // Supabase pooler uses a cert chain that fails strict Node TLS on some networks.
  if (connectionString.includes("supabase.com")) {
    config.ssl = { rejectUnauthorized: false };
  }

  return new Pool(config);
}
