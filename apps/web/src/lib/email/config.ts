export type EmailPurpose = "register";

export type EmailLogStatus = "sent" | "failed" | "dev_preview";

export function getEmailConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim() || "Doora <noreply@doora.app>";
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  return {
    host,
    port,
    user,
    pass,
    from,
    secure,
    isConfigured: Boolean(host && user && pass),
    otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES || 10),
    otpLength: Number(process.env.OTP_LENGTH || 6),
    maxSendPerWindow: Number(
      process.env.OTP_MAX_SENDS_PER_WINDOW ||
        (process.env.NODE_ENV === "development" ? 10 : 3),
    ),
    sendWindowMinutes: Number(
      process.env.OTP_SEND_WINDOW_MINUTES ||
        (process.env.NODE_ENV === "development" ? 5 : 15),
    ),
    maxVerifyAttempts: Number(process.env.OTP_MAX_VERIFY_ATTEMPTS || 5),
  };
}
