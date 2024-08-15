import { LOCAL_PREVIEW, getSecret } from "astro:env/server";

/**
 * Represents the possible runtime environments.
 *
 * - `dev`: Development environment. When started by `astro dev`.
 * - `preview`: Preview environment. When in Vercel preview environment or `LOCAL_PREVIEW` env is set to true.
 * - `production`: Production environment. Other situations.
 */
type RuntimeEnv = "dev" | "preview" | "production";

export default function runtimeEnv(): RuntimeEnv {
  if (import.meta.env.DEV) return "dev";
  if (LOCAL_PREVIEW || getSecret("VERCEL_ENV") === "preview") return "preview";
  return "production";
}
