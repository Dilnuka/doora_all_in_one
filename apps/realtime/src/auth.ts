import jwt from "jsonwebtoken";
import type { Socket } from "socket.io";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return secret;
}

export function signSocketToken(userId: string) {
  return jwt.sign({ sub: userId }, getSecret(), { expiresIn: "7d" });
}

export function verifySocketToken(token: string): string {
  const payload = jwt.verify(token, getSecret()) as { sub?: string };
  if (!payload.sub) throw new Error("Invalid token");
  return payload.sub;
}

export async function socketAuth(socket: Socket, next: (err?: Error) => void) {
  try {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Authentication required"));
    socket.data.userId = verifySocketToken(token);
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
}
