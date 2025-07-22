import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./db/instance";
import { factory } from "./factory";
import { dbPlugin } from "./db/db-plugin";
import { betterAuthPlugin } from "./auth/auth-plugin";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import comments from "./modules/comments";
import { logger } from "hono/logger";
import { config } from "./config";
import { notificationPlugin } from "./notification/plugin";

await migrate(db, { migrationsFolder: "./drizzle" });

console.log("Migration done.");

const app = factory
  .createApp()
  .use(logger())
  .use(dbPlugin(db))
  .use(betterAuthPlugin)
  .use(notificationPlugin())
  .use(
    "/api/v1/*",
    cors({
      origin: config.trustedUrls,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  )
  .on(["POST", "GET"], "/api/v1/auth/*", (c) => {
    return c.get("authClient").handler(c.req.raw);
  })
  .route("/api/v1/comments", comments);

const server = serve({
  fetch: app.fetch,
  port: config.port,
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

export type App = typeof app;

console.log(
  `Server started...
- local port: ${config.port}
- app url: ${config.appUrl}
- db file: ${config.dbFileName}
- trusted urls: ${config.trustedUrls.join(", ")}`,
);
