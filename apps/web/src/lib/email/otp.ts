import bcrypt from "bcryptjs";
import { prisma } from "@doora/database";
import type { EmailPurpose } from "./config";
import { getEmailConfig } from "./config";
import { sendEmail } from "./send";
import { buildOtpEmail } from "./templates";

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

function generateOtpCode(length: number) {
  const max = 10 ** length;
  const min = 10 ** (length - 1);
  return String(Math.floor(min + Math.random() * (max - min)));
}

export async function createAndSendOtp(email: string, purpose: EmailPurpose) {
  const normalized = normalizeEmail(email);
  const config = getEmailConfig();

  const recentSends = await prisma.emailOtp.count({
    where: {
      email: normalized,
      purpose,
      createdAt: {
        gte: new Date(Date.now() - config.sendWindowMinutes * 60 * 1000),
      },
    },
  });

  if (recentSends >= config.maxSendPerWindow) {
    throw new Error(
      `Too many OTP requests. Please wait ${config.sendWindowMinutes} minutes and try again.`,
    );
  }

  const code = generateOtpCode(config.otpLength);
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + config.otpExpiryMinutes * 60 * 1000);

  await prisma.emailOtp.create({
    data: {
      email: normalized,
      codeHash,
      purpose,
      expiresAt,
    },
  });

  const template = buildOtpEmail(code);
  await sendEmail({
    to: normalized,
    subject: template.subject,
    text: template.text,
    html: template.html,
    type: `otp_${purpose}`,
    meta: { purpose, expiresAt: expiresAt.toISOString() },
  });

  return {
    email: normalized,
    expiresAt,
    previewCode: process.env.NODE_ENV === "development" && !config.isConfigured ? code : undefined,
  };
}

export async function verifyOtp(email: string, code: string, purpose: EmailPurpose) {
  const normalized = normalizeEmail(email);
  const config = getEmailConfig();

  const otp = await prisma.emailOtp.findFirst({
    where: {
      email: normalized,
      purpose,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    return { ok: false as const, error: "Invalid or expired code." };
  }

  if (otp.attempts >= config.maxVerifyAttempts) {
    return { ok: false as const, error: "Too many attempts. Request a new code." };
  }

  const matches = await bcrypt.compare(code, otp.codeHash);
  if (!matches) {
    await prisma.emailOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false as const, error: "Invalid or expired code." };
  }

  await prisma.emailOtp.update({
    where: { id: otp.id },
    data: { usedAt: new Date() },
  });

  return { ok: true as const };
}
