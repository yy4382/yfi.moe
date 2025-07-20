import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./db/instance";
import { comments } from "./modules/comments";

migrate(db, { migrationsFolder: "./drizzle" });

const app = new Elysia({ adapter: node(), prefix: "/api/v1" })
  .use(comments)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
