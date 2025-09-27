import { serve } from "@hono/node-server";
import { Scalar } from "@scalar/hono-api-reference";
import { migrate } from "drizzle-orm/libsql/migrator";
import { describeRoute, openAPIRouteHandler } from "hono-openapi";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { requestId } from "hono/request-id";
import { betterAuthPlugin } from "@/auth/auth-plugin.js";
import { dbPlugin } from "@/db/db-plugin.js";
import { db } from "@/db/instance.js";
import { factory } from "@/factory.js";
import { accountApp } from "@/modules/account/account.js";
import comments from "@/modules/comments/index.js";
import { notificationPlugin } from "@/notification/plugin.js";
import { akismetPlugin } from "@/services/akismet-plugin.js";
import { env } from "./env.js";
import { pinoMiddleware, logger } from "./logger.js";
import { anonymousIdentityPlugin } from "./plugins/anonymous-identity.js";

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
  .use(anonymousIdentityPlugin())
  .use(
    "/v1/*",
    cors({
      origin: [
        new URL(env.FRONTEND_URL).origin,
        new URL(env.BACKEND_URL).origin,
      ],
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length", "X-Request-ID", "x-anonymous-key"],
      maxAge: 600,
      credentials: true,
    }),
  )
  .on(["POST", "GET"], "/v1/auth/*", (c) => {
    return c.get("authClient").handler(c.req.raw);
  })
  .route("/v1/comments", comments)
  .route("/v1/account", accountApp)
  .get(
    "/health",
    describeRoute({
      description: "Health check endpoint",
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { status: { type: "string" } },
              },
            },
          },
        },
      },
    }),
    (c) => {
      return c.json({ status: "ok" });
    },
  );

app.get(
  "/openapi.json",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "yfi.moe API",
        version: "1.0.0",
      },
      servers: [{ url: "http://localhost:3001", description: "Local Server" }],
    },
  }),
);

app.get(
  "/docs",
  Scalar({
    pageTitle: "yfi.moe API Reference",
    sources: [
      {
        url: "/api/openapi.json",
        title: "Main API",
      },
      {
        url: "/api/v1/auth/open-api/generate-schema",
        title: "Better auth API",
      },
    ],
  }),
);

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
