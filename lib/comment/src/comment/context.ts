import { createAuthClient as createAuthClientBetterAuth } from "better-auth/client";
import { adminClient, magicLinkClient } from "better-auth/client/plugins";
import { hc } from "hono/client";
import { createContext, type RefObject } from "react";
import type { AppType } from "@repo/backend";

export const PathnameContext = createContext<string>("");
export const ServerURLContext = createContext<string>("");

export const AuthClientRefContext = createContext<RefObject<AuthClient>>(null!);
export const HonoClientRefContext = createContext<RefObject<HonoClient>>(null!);

export function createAuthClient(serverURL: string) {
  return createAuthClientBetterAuth({
    baseURL: new URL("v1/auth", serverURL).href,
    plugins: [adminClient(), magicLinkClient()],
  });
}
export function createHonoClient(serverURL: string) {
  return hc<AppType>(new URL(serverURL).origin, {
    init: {
      credentials: "include",
    },
  }).api.v1;
}

export type CommentYulineContextType = {
  serverURL: string;
  pathname: string;
};

export type AuthClient = ReturnType<typeof createAuthClient>;
export type HonoClient = ReturnType<typeof createHonoClient>;
