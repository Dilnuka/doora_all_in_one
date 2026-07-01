import type { Role } from "@doora/database";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      cafeteriaId: string | null;
      roomId: string | null;
      tower: string | null;
      apartment: string | null;
    };
  }

  interface User {
    role: Role;
    cafeteriaId?: string | null;
    roomId?: string | null;
    tower?: string | null;
    apartment?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    cafeteriaId?: string | null;
    roomId?: string | null;
    tower?: string | null;
    apartment?: string | null;
  }
}
