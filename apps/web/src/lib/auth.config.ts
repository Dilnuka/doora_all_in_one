import type { NextAuthConfig } from "next-auth";
import type { Role } from "@doora/database";

const protectedPrefixes = ["/food", "/chat", "/room", "/admin", "/doora"];

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as Role;
        token.cafeteriaId = user.cafeteriaId ?? null;
        token.roomId = user.roomId ?? null;
        token.tower = user.tower ?? null;
        token.apartment = user.apartment ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as Role;
        session.user.cafeteriaId = (token.cafeteriaId as string | null) ?? null;
        session.user.roomId = (token.roomId as string | null) ?? null;
        session.user.tower = (token.tower as string | null) ?? null;
        session.user.apartment = (token.apartment as string | null) ?? null;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/register");
      const isProtected =
        pathname === "/" ||
        protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

      if (isAuthPage && auth?.user) {
        return Response.redirect(new URL("/", request.url));
      }

      if (isProtected && !auth?.user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return Response.redirect(loginUrl);
      }

      if (pathname.startsWith("/admin") && auth?.user?.role !== "ADMIN") {
        return Response.redirect(new URL("/", request.url));
      }

      if (pathname.startsWith("/food/dashboard") && auth?.user?.role !== "CAFETERIA") {
        return Response.redirect(new URL("/food", request.url));
      }

      if (
        (pathname.startsWith("/food/checkout") || pathname.startsWith("/food/orders")) &&
        auth?.user?.role !== "RESIDENT"
      ) {
        return Response.redirect(
          new URL(auth?.user?.role === "CAFETERIA" ? "/food/dashboard" : "/food", request.url),
        );
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
