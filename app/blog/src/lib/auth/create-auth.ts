import type { DbClient } from "@/lib/db/db-plugin";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../db/schema";
import { admin, magicLink } from "better-auth/plugins";
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
    plugins: [
      admin(),
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          // Import the email service factory dynamically to avoid circular dependencies
          const { EmailServiceFactory } = await import(
            "../hono/notification/providers"
          );

          const emailConfig = EmailServiceFactory.createConfigFromEnv(env);
          const authEmailService =
            EmailServiceFactory.getAuthService(emailConfig);

          if (authEmailService.isEnabled()) {
            await authEmailService.sendMagicLinkEmail(email, url);
          } else {
            console.log("Email provider not configured, magic link URL:", url);
            throw new Error("Email provider not configured");
          }
        },
        expiresIn: 300, // 5 minutes
        disableSignUp: false, // Allow new user registration via magic link
      }),
    ],
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
  });
};

export type AuthClient = ReturnType<typeof createAuth>;
