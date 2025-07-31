import "dotenv/config";

import { logger } from "hono/logger";
import { factory } from "@/factory.js";
import { dbPlugin } from "@/db/db-plugin.js";
import { betterAuthPlugin } from "@/auth/auth-plugin.js";
import { notificationPlugin } from "@/notification/plugin.js";
import { db } from "@/db/instance.js";
import comments from "@/modules/comments/index.js";
import { accountApp } from "@/modules/account/account.js";
import { serve } from "@hono/node-server";
import { env } from "./env.js";
import { cors } from "hono/cors";

const app = factory
  .createApp()
  .basePath("/api")
  .use(logger())
  .use(dbPlugin(db))
  .use(betterAuthPlugin)
  .use(notificationPlugin())
  .use(
    "/v1/*",
    cors({
      origin: [
        new URL(env.FRONTEND_URL).origin,
        new URL(env.BACKEND_URL).origin,
      ],
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  )
  .on(["POST", "GET"], "/v1/auth/*", (c) => {
    return c.get("authClient").handler(c.req.raw);
  })
  .route("/v1/comments", comments)
  .route("/v1/account", accountApp);

const server = serve({
  fetch: app.fetch,
  port: 3001,
});

// graceful shutdown
process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});
process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
