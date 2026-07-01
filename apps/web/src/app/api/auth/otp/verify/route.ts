import { NextResponse } from "next/server";
import type { EmailPurpose } from "@/lib/email/config";
import { verifyOtp } from "@/lib/email/otp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    const code = String(body.code ?? "").trim();
    const purpose = (body.purpose ?? "login") as EmailPurpose;

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const result = await verifyOtp(email, code, purpose);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify code";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
