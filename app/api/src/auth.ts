import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { db } from "./db/instance.js"; // your drizzle instance

export function getAuth(dbInst: typeof db) {
  return betterAuth({
    database: drizzleAdapter(dbInst, {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "user",
          input: false,
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof getAuth>;
