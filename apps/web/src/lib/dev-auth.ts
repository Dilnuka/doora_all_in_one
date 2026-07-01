import type { Role } from "@doora/database";

/** Temporary local bypass — set DEV_SKIP_AUTH=true in apps/web/.env.local only. Never in production. */
export function isDevSkipAuthEnabled() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.DEV_SKIP_AUTH === "true"
  );
}

export const DEV_SKIP_PASSWORD = "dev-skip-only";

export type DevAuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  cafeteriaId: string | null;
  roomId: string | null;
  tower: string | null;
  apartment: string | null;
};

/** Mock users for UI exploration when PostgreSQL is not running. */
export const DEV_MOCK_USERS: DevAuthUser[] = [
  {
    id: "dev-mock-resident",
    name: "Demo Resident",
    email: "resident@demo.com",
    role: "RESIDENT",
    cafeteriaId: null,
    roomId: null,
    tower: "A",
    apartment: "101",
  },
  {
    id: "dev-mock-guest",
    name: "Demo Guest",
    email: "guest@doora.local",
    role: "GUEST",
    cafeteriaId: null,
    roomId: "dev-mock-room",
    tower: "B",
    apartment: "205",
  },
  {
    id: "dev-mock-admin",
    name: "Demo Admin",
    email: "admin@doora.local",
    role: "ADMIN",
    cafeteriaId: null,
    roomId: "dev-mock-room",
    tower: null,
    apartment: null,
  },
  {
    id: "dev-mock-cafe",
    name: "Spice Route Cafe",
    email: "cafe@demo.com",
    role: "CAFETERIA",
    cafeteriaId: "dev-mock-cafeteria",
    roomId: null,
    tower: null,
    apartment: null,
  },
];

export function resolveDevMockUser(email: string, password: string): DevAuthUser | null {
  if (!isDevSkipAuthEnabled() || password !== DEV_SKIP_PASSWORD) {
    return null;
  }
  return DEV_MOCK_USERS.find((u) => u.email === email.toLowerCase().trim()) ?? null;
}
