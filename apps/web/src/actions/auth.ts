"use server";

import bcrypt from "bcryptjs";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { prisma } from "@doora/database";
import type { Role } from "@doora/database";
import { createAndSendOtp, verifyOtp } from "@/lib/email/otp";

export type AuthState = {
  error?: string;
  success?: string;
  previewCode?: string;
  step?: "details" | "otp";
  email?: string;
  name?: string;
};

const PENDING_SIGNUP_TTL_MS = 30 * 60 * 1000;

function parseRegisterFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").toLowerCase().trim(),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "RESIDENT") as Role,
    tower: String(formData.get("tower") ?? "").trim() || null,
    apartment: String(formData.get("apartment") ?? "").trim() || null,
  };
}

export async function startRegisterAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { name, email, password, role, tower, apartment } = parseRegisterFields(formData);

  if (!name || !email || password.length < 6) {
    return {
      error: "Please fill all required fields. Password must be at least 6 characters.",
      step: "details",
    };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists.", step: "details", email };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const expiresAt = new Date(Date.now() + PENDING_SIGNUP_TTL_MS);

  await prisma.pendingSignup.upsert({
    where: { email },
    create: {
      email,
      name,
      passwordHash,
      role: role === "GUEST" ? "GUEST" : "RESIDENT",
      tower: role !== "GUEST" ? tower : null,
      apartment: role !== "GUEST" ? apartment : null,
      expiresAt,
    },
    update: {
      name,
      passwordHash,
      role: role === "GUEST" ? "GUEST" : "RESIDENT",
      tower: role !== "GUEST" ? tower : null,
      apartment: role !== "GUEST" ? apartment : null,
      expiresAt,
    },
  });

  try {
    const result = await createAndSendOtp(email, "register");
    return {
      success: "Verification code sent. Check your email.",
      step: "otp",
      email,
      name,
      previewCode: result.previewCode,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to send verification code.",
      step: "details",
      email,
      name,
    };
  }
}

export async function completeRegisterAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { name, email, password, role, tower, apartment } = parseRegisterFields(formData);
  const code = String(formData.get("code") ?? "").trim();

  if (!email || !code) {
    return { error: "Email and verification code are required.", step: "otp", email, name };
  }

  const pending = await prisma.pendingSignup.findUnique({ where: { email } });
  if (!pending || pending.expiresAt < new Date()) {
    return {
      error: "Registration session expired. Please start again.",
      step: "details",
      email,
      name,
    };
  }

  const verified = await verifyOtp(email, code, "register");
  if (!verified.ok) {
    return { error: verified.error, step: "otp", email, name };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.pendingSignup.delete({ where: { email } }).catch(() => {});
    return { error: "An account with this email already exists.", step: "details", email };
  }

  await prisma.user.create({
    data: {
      name: pending.name,
      email: pending.email,
      passwordHash: pending.passwordHash,
      role: pending.role,
      tower: pending.tower,
      apartment: pending.apartment,
      emailVerified: new Date(),
    },
  });

  await prisma.pendingSignup.delete({ where: { email } });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: "Account created. Please sign in.", step: "details" };
  }

  return {};
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || "/",
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }

  return {};
}

export async function logoutAction() {
  const { signOut } = await import("@/lib/auth");
  await signOut({ redirectTo: "/login" });
}
