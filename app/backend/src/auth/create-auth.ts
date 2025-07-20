import type { DbClient } from "@/db/db-plugin";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../db/schema";
import { admin } from "better-auth/plugins";

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
      enabled: false,
    },
    plugins: [admin()],
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
      },
    },
  });
};

export type AuthClient = ReturnType<typeof createAuth>;
