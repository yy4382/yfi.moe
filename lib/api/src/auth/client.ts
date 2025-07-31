import { createAuthClient } from "better-auth/react";
import { adminClient, magicLinkClient } from "better-auth/client/plugins";

export const authClient = (serverUrl: string) =>
  createAuthClient({
    baseURL: new URL("v1/auth", serverUrl).href,
    plugins: [adminClient(), magicLinkClient()],
  });

export type Session = Awaited<
  ReturnType<typeof authClient>
>["$Infer"]["Session"]["session"];
export type User = Awaited<
  ReturnType<typeof authClient>
>["$Infer"]["Session"]["user"];
