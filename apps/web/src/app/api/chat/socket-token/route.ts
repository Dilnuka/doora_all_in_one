import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const token = jwt.sign({ sub: session.user.id }, secret, { expiresIn: "7d" });
  return NextResponse.json({ token });
}
