/**
 * Represents the possible runtime environments.
 *
 * - `dev`: Development environment.
 * - `preview`: Preview environment.
 * - `production`: Production environment.
 */
type RuntimeEnv = "dev" | "preview" | "production";

export default function runtimeEnv(): RuntimeEnv {
  if (import.meta.env.DEV) return "dev";
  if (import.meta.env.LOCAL_PREVIEW || import.meta.env.VERCEL_ENV === "preview")
    return "preview";
  return "production";
}
