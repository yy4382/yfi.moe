import { Hono } from "hono";
import { injectDeps, type Variables } from "./middleware.js";
import { drizzle } from "drizzle-orm/libsql";
import { commentApp } from "./comments.js";
import { describe, test, expect } from "vitest";
import * as schema from "./db/schema.js";
// import { createRequire } from "node:module";
import { migrate } from "drizzle-orm/libsql/migrator";

// const require = createRequire(import.meta.url);

async function getTestApp() {
  // const { pushSQLiteSchema } =
  // require("drizzle-kit/api") as typeof import("drizzle-kit/api");
  const app = new Hono<{ Variables: Variables }>();
  const db = drizzle(":memory:", { schema });

  // const { apply } = await pushSQLiteSchema(schema, db as any);
  // await apply();
  await migrate(db, { migrationsFolder: "./drizzle" });

  console.log("creating test app");
  injectDeps(app, db as any);

  app.route("/api/comments", commentApp);
  return app;
}

describe("list comments", () => {
  test("should return empty array if no comments", async () => {
    const app = await getTestApp();
    const res = await app.request("/api/comments/test");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });
});
