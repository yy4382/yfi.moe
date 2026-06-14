import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

const clientEnvSchema = z.object({
  VITE_WALINE_URL: optionalUrl,
  VITE_POSTHOG_KEY: z.string().optional(),
  VITE_POSTHOG_HOST: optionalUrl,
});

export function getClientEnv() {
  return clientEnvSchema.parse(import.meta.env);
}

export function getOptionalClientEnv() {
  return clientEnvSchema.partial().parse(import.meta.env);
}
