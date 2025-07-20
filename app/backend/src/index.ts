import "@dotenvx/dotenvx/config";

import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./db/instance";

migrate(db, { migrationsFolder: "./drizzle" });

const app = new Elysia({ adapter: node(), prefix: "/api/v1" })
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
