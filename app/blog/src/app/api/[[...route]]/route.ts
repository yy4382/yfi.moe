import { logger } from "hono/logger";
import { factory } from "@/lib/hono/factory";
import { dbPlugin } from "@/lib/db/db-plugin";
import { betterAuthPlugin } from "@/lib/auth/auth-plugin";
import { notificationPlugin } from "@/lib/hono/notification/plugin";
import { db } from "@/lib/db/instance";
import comments from "@/lib/hono/modules/comments";
import { handle } from "hono/vercel";
import { accountApp } from "@/lib/hono/modules/account/account";

const app = factory
  .createApp()
  .basePath("/api")
  .use(logger())
  .use(dbPlugin(db))
  .use(betterAuthPlugin)
  .use(notificationPlugin())
  .on(["POST", "GET"], "/v1/auth/*", (c) => {
    return c.get("authClient").handler(c.req.raw);
  })
  .route("/v1/comments", comments)
  .route("/v1/account", accountApp);

export type App = typeof app;

export const GET = handle(app);
export const POST = handle(app);
