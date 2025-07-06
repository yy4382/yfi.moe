import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { queryOptions } from "@tanstack/react-query";

export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export type User = typeof authClient.$Infer.Session.user;
export type Session = typeof authClient.$Infer.Session.session;

export const sessionQueryOptions = queryOptions({
  queryKey: ["auth", "session"],
  queryFn: async () => {
    const data = await authClient.getSession();
    return data.data || null;
  },
  staleTime: 1000 * 60 * 60, // 1 hour
  retry: false, // Don't retry auth failures
});
