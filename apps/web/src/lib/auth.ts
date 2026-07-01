import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@doora/database";
import { authConfig } from "@/lib/auth.config";
import { resolveDevMockUser } from "@/lib/dev-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        const devUser = resolveDevMockUser(email, password);
        if (devUser) {
          return devUser;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          cafeteriaId: user.cafeteriaId,
          roomId: user.roomId,
          tower: user.tower,
          apartment: user.apartment,
        };
      },
    }),
  ],
});
