import { createAuthClient as createAuthClientBetterAuth } from "better-auth/client";
import { adminClient, magicLinkClient } from "better-auth/client/plugins";
import { createContext, type RefObject } from "react";

export const PathnameContext = createContext<string>("");
export const ServerURLContext = createContext<string>("");

export const AuthClientRefContext = createContext<RefObject<AuthClient>>(null!);

export function createAuthClient(serverURL: string) {
  return createAuthClientBetterAuth({
    baseURL: new URL("v1/auth", serverURL).href,
    plugins: [adminClient(), magicLinkClient()],
  });
}

export type CommentYulineContextType = {
  serverURL: string;
  pathname: string;
};

export type AuthClient = ReturnType<typeof createAuthClient>;
