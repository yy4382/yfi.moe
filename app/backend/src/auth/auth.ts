import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/instance";
import * as schema from "../db/schema";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  basePath: "/auth",
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
});

type SessionResult = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

export type User = SessionResult["user"];
export type Session = SessionResult["session"];
