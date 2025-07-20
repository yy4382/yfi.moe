import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./db/instance";
import { factory } from "./factory";
import { dbPlugin } from "./db/db-plugin";
import { betterAuthPlugin } from "./auth/auth-plugin";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server/.";

migrate(db, { migrationsFolder: "./drizzle" });

const app = factory
  .createApp()
  .use(dbPlugin(db))
  .use(betterAuthPlugin)
  .on(["POST", "GET"], "/api/v1/auth/*", (c) => {
    return c.get("authClient").handler(c.req.raw);
  })
  .use(
    "/api/v1/*",
    cors({
      origin: "http://localhost:3001", //TODO: change to env
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  );

const server = serve(app);

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
