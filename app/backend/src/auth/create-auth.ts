import type { DbClient } from "@/db/db-plugin.js";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/db/schema.js";
import { admin, magicLink } from "better-auth/plugins";
import { env } from "@/env.js";
import { EmailNotifier } from "@/notification/providers/email.js";
import NotionMagicLinkEmail from "./magic-link.js";
import { logger } from "@/logger.js";

export const createAuth = (db: DbClient) => {
  return betterAuth({
    baseURL: new URL("v1/auth", env.BACKEND_URL).href,
    trustedOrigins: [
      new URL(env.FRONTEND_URL).origin,
      new URL(env.BACKEND_URL).origin,
    ],
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
          const emailService = EmailNotifier.createFromEnv(env);
          if (!emailService) {
            logger.error(
              "Email provider not configured, magic link URL: %s",
              url,
            );
            return;
          }

          const { html, text } = await EmailNotifier.renderEmailTemplate(
            NotionMagicLinkEmail,
            { url },
          );
          await emailService.sendEmail({
            to: email,
            subject: "登录链接 - Yunfi",
            html,
            text,
          });
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
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
      },
    },
  });
};

export type AuthClient = ReturnType<typeof createAuth>;
