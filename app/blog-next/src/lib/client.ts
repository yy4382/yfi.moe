import { env } from "@/env";
import { createAuthClient } from "better-auth/react";
import { adminClient, magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: new URL("v1/auth", env.NEXT_PUBLIC_BACKEND_URL).href,
  plugins: [adminClient(), magicLinkClient()],
});

export type Session = typeof authClient.$Infer.Session;
