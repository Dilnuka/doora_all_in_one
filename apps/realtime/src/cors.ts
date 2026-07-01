import type { CorsOptions } from "cors";

/** Comma-separated origins, e.g. https://app.doora.com,https://doora-platform.vercel.app */
export function getAllowedOrigins(): string[] {
  const raw =
    process.env.ALLOWED_ORIGINS ||
    process.env.WEB_ORIGIN ||
    "http://localhost:3000";
  return raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

export function createCorsOptions(): CorsOptions {
  const allowed = getAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  };
}
