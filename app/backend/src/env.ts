import { z } from "zod";

const envSchema = z.object({
  FRONTEND_URL: z.string(),
  BACKEND_URL: z.string(),

  UNSUBSCRIBE_SECRET: z.string(),

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

  AKISMET_KEY: z.string().optional(),
  AKISMET_BLOG: z.string().optional(),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .optional(),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
