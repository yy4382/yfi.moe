import "@dotenvx/dotenvx/config";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { commentApp } from "@/routes/comments.js";
import { injectDeps, type Variables } from "@/middleware.js";
import { db } from "@/db/instance.js";
import { migrate } from "drizzle-orm/libsql/migrator";
import { utils } from "@/routes/utils.js";

const app = new Hono<{ Variables: Variables }>();

await migrate(db, { migrationsFolder: "./drizzle" });

injectDeps(app, db);

app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return c.get("auth").handler(c.req.raw);
});

app.get("/api/ping", (c) => c.json({ message: "pong" }));

app.route("/api/comments/v1", commentApp);
app.route("/api/utils/v1", utils);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
