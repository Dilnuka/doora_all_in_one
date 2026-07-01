import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { getEmailConfig } from "./config";

let transporter: Transporter | null = null;

export function getMailTransport() {
  const config = getEmailConfig();
  if (!config.isConfigured) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  return transporter;
}

export function resetMailTransport() {
  transporter = null;
}
