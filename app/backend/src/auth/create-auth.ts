import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, magicLink, openAPI } from "better-auth/plugins";
import type { DbClient } from "@/db/db-plugin.js";
import * as schema from "@/db/schema.js";
import { env } from "@/env.js";
import { logger } from "@/logger.js";
import { EmailNotifier } from "@/services/notification/providers/email.js";
import NotionMagicLinkEmail from "./magic-link.js";

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
      openAPI(),
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
