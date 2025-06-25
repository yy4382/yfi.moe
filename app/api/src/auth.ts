import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { db } from "./db/instance.js";
import { admin } from "better-auth/plugins";
import * as schema from "./db/schema.js";

export function getAuth(dbInst: typeof db) {
  return betterAuth({
    database: drizzleAdapter(dbInst, {
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
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    },
  });
}

export type Auth = ReturnType<typeof getAuth>;
