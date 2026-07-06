import { getEmailConfig } from "./config";

export function buildOtpEmail(code: string) {
  const subject = `${code} is your Doora verification code`;
  const text = [
    `Your Doora verification code is: ${code}`,
    "",
    `Use this code to complete your registration. It expires in ${getEmailConfig().otpExpiryMinutes} minutes.`,
    "",
    "If you did not request this code, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#2C3E50;margin:0 0 8px">Verify your email</h2>
      <p style="color:#475569;margin:0 0 20px">Use this code to complete your Doora registration:</p>
      <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#E67E22;padding:16px 20px;background:#FDF2E9;border-radius:12px;text-align:center">
        ${code}
      </div>
      <p style="color:#64748b;font-size:14px;margin-top:20px">
        This code expires in ${getEmailConfig().otpExpiryMinutes} minutes.
      </p>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px">
        If you did not request this code, you can safely ignore this email.
      </p>
    </div>
  `;

  return { subject, text, html };
}
