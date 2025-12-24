import { createAuthClient as createAuthClientBetterAuth } from "better-auth/client";
import { adminClient, magicLinkClient } from "better-auth/client/plugins";

export function createAuthClient(serverURL: string) {
  return createAuthClientBetterAuth({
    baseURL: new URL("v1/auth", serverURL).href,
    plugins: [adminClient(), magicLinkClient()],
  });
}

export type AuthClient = ReturnType<typeof createAuthClient>;
