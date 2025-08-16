import { env } from "@/env";
import { authClient as createAuthClient } from "@repo/api/auth/client";

export const authClient = createAuthClient(env.NEXT_PUBLIC_BACKEND_URL);

export type Session = typeof authClient.$Infer.Session;
