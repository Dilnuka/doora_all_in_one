import { NextResponse } from "next/server";
import { prisma } from "@doora/database";
import { createAndSendOtp } from "@/lib/email/otp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const pending = await prisma.pendingSignup.findUnique({ where: { email } });
    if (!pending) {
      return NextResponse.json(
        { error: "No pending registration found. Start signup first." },
        { status: 400 },
      );
    }

    const result = await createAndSendOtp(email, "register");

    return NextResponse.json({
      ok: true,
      message: "Verification code sent.",
      expiresAt: result.expiresAt.toISOString(),
      previewCode: result.previewCode,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send code";
    const status = message.includes("Too many") ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
