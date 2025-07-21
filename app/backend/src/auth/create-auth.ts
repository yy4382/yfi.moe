import type { DbClient } from "@/db/db-plugin";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../db/schema";
import { admin } from "better-auth/plugins";
import { config } from "@/config";

export const createAuth = (db: DbClient) => {
  return betterAuth({
    basePath: "/api/v1/auth",
    baseURL: config.appUrl,
    trustedOrigins: [config.appUrl, ...config.trustedUrls],
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
        clientId: config.githubClientId,
        clientSecret: config.githubClientSecret,
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
