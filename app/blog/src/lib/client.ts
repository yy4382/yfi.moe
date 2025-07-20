import { hc, type BackendAppType } from "@repo/backend/client";
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const honoClient = hc<BackendAppType>(process.env.BACKEND_URL!).api.v1;

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL!,
  basePath: "/api/v1/auth",
  plugins: [adminClient()],
});
