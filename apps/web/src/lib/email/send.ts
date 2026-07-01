import { prisma, Prisma } from "@doora/database";
import type { EmailLogStatus } from "./config";
import { getEmailConfig } from "./config";
import { getMailTransport } from "./transport";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
  type: string;
  meta?: Prisma.InputJsonValue;
};

export async function sendEmail(input: SendEmailInput) {
  const config = getEmailConfig();
  const transport = getMailTransport();

  if (!transport) {
    if (process.env.NODE_ENV === "development") {
      console.info(
        `[email:dev_preview] to=${input.to} subject="${input.subject}"\n${input.text}`,
      );
      return logEmail({
        to: input.to,
        subject: input.subject,
        type: input.type,
        status: "dev_preview",
        provider: "console",
        meta: { preview: input.text, ...(input.meta as object | undefined) },
      });
    }

    const error = "SMTP is not configured";
    await logEmail({
      to: input.to,
      subject: input.subject,
      type: input.type,
      status: "failed",
      provider: "smtp",
      error,
      meta: input.meta,
    });
    throw new Error(error);
  }

  try {
    const result = await transport.sendMail({
      from: config.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });

    return logEmail({
      to: input.to,
      subject: input.subject,
      type: input.type,
      status: "sent",
      provider: "smtp",
      messageId: result.messageId,
      meta: input.meta,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    await logEmail({
      to: input.to,
      subject: input.subject,
      type: input.type,
      status: "failed",
      provider: "smtp",
      error: message,
      meta: input.meta,
    });
    throw error;
  }
}

async function logEmail(input: {
  to: string;
  subject: string;
  type: string;
  status: EmailLogStatus;
  provider?: string;
  messageId?: string;
  error?: string;
  meta?: Prisma.InputJsonValue;
}) {
  return prisma.emailLog.create({
    data: {
      to: input.to,
      subject: input.subject,
      type: input.type,
      status: input.status,
      provider: input.provider,
      messageId: input.messageId,
      error: input.error,
      meta: input.meta ?? undefined,
    },
  });
}

export async function getRecentEmailLogs(limit = 50) {
  return prisma.emailLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
