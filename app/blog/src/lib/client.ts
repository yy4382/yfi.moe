import { hc, type BackendAppType } from "@repo/backend/client";
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const honoClient = hc<BackendAppType>(
  process.env.NEXT_PUBLIC_BACKEND_URL!,
  {
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      return fetch(input, {
        ...init,
        credentials: "include",
      });
    },
  },
).api.v1;

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL!,
  basePath: "/api/v1/auth",
  plugins: [adminClient()],
});

export type Session = typeof authClient.$Infer.Session;
