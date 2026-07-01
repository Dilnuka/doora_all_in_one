"use server";

import bcrypt from "bcryptjs";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { prisma } from "@doora/database";
import type { Role } from "@doora/database";

export type AuthState = {
  error?: string;
  success?: string;
};

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "RESIDENT") as Role;
  const tower = String(formData.get("tower") ?? "").trim() || null;
  const apartment = String(formData.get("apartment") ?? "").trim() || null;

  if (!name || !email || password.length < 6) {
    return {
      error: "Please fill all required fields. Password must be at least 6 characters.",
    };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role === "GUEST" ? "GUEST" : "RESIDENT",
      tower: role !== "GUEST" ? tower : null,
      apartment: role !== "GUEST" ? apartment : null,
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: "Account created. Please sign in." };
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
