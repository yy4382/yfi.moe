import { z } from "zod";

const clientEnvSchema = z.object({
  VITE_WALINE_URL: z.string().url(),
  VITE_POSTHOG_KEY: z.string().optional(),
  VITE_POSTHOG_HOST: z.string().url().optional(),
});

export function getClientEnv() {
  return clientEnvSchema.parse(import.meta.env);
}

export function getOptionalClientEnv() {
  return clientEnvSchema.partial().parse(import.meta.env);
}
