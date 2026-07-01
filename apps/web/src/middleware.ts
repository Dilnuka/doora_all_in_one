import { auth } from "@/lib/auth-edge";

export default auth;

export const config = {
  matcher: [
    "/",
    "/food/:path*",
    "/chat/:path*",
    "/room/:path*",
    "/admin/:path*",
    "/doora/:path*",
    "/login",
    "/register",
  ],
};
