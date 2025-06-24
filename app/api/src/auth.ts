import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { db } from "./db/instance.js";
import { admin } from "better-auth/plugins";

export function getAuth(dbInst: typeof db) {
  return betterAuth({
    database: drizzleAdapter(dbInst, {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [admin()],
  });
}

export type Auth = ReturnType<typeof getAuth>;
