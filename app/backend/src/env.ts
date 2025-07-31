import { z } from "zod";

const envSchema = z.object({
  FRONTEND_URL: z.string(),
  BACKEND_URL: z.string(),

  UNSUBSCRIBE_SECRET: z.string(),

  UPSTASH_REDIS_REST_URL: z.url(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  DATABASE_URL: z.string(),

  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),

  EMAIL_NOTIFICATION_ENABLED: z.stringbool(),
  EMAIL_FROM: z.email(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_SECURE: z.stringbool(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
});

export const env = envSchema.parse(process.env);
