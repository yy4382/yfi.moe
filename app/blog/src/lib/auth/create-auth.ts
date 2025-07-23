import type { DbClient } from "@/lib/db/db-plugin";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../db/schema";
import { admin } from "better-auth/plugins";
import { env } from "@/env";

export const createAuth = (db: DbClient) => {
  return betterAuth({
    basePath: "/api/v1/auth",
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        ...schema,
      },
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [admin()],
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
  });
};

export type AuthClient = ReturnType<typeof createAuth>;
