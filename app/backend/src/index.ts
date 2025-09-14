import { factory } from "@/factory.js";
import { dbPlugin } from "@/db/db-plugin.js";
import { betterAuthPlugin } from "@/auth/auth-plugin.js";
import { notificationPlugin } from "@/notification/plugin.js";
import { akismetPlugin } from "@/services/akismet-plugin.js";
import { db } from "@/db/instance.js";
import comments from "@/modules/comments/index.js";
import { accountApp } from "@/modules/account/account.js";
import { serve } from "@hono/node-server";
import { env } from "./env.js";
import { cors } from "hono/cors";
import { migrate } from "drizzle-orm/libsql/migrator";
import { requestId } from "hono/request-id";
import { pinoMiddleware, logger } from "./logger.js";
import { HTTPException } from "hono/http-exception";

await migrate(db, { migrationsFolder: "./drizzle" });

const app = factory
  .createApp()
  .basePath(new URL(env.BACKEND_URL).pathname)
  .use(requestId())
  .use(pinoMiddleware)
  .use(dbPlugin(db))
  .use(betterAuthPlugin)
  .use(notificationPlugin(env))
  .use(akismetPlugin)
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
  .get("/health", (c) => {
    return c.json({ status: "ok" });
  })
  .route("/v1/comments", comments)
  .route("/v1/account", accountApp);

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  c.get("logger").error({ err }, "Unhandled error");
  return c.json({ error: "Internal Server Error" }, 500);
});

const server = serve({
  fetch: app.fetch,
  port: Number(new URL(env.BACKEND_URL).port) || 3001,
});

// graceful shutdown
process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});
process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      logger.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});

logger.info(`Server started on ${env.BACKEND_URL}`);
logger.info(`Health check on ${new URL("health", env.BACKEND_URL)}`);
