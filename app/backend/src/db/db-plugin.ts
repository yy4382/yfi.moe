import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { factory } from "@/factory.js";
import type * as schema from "./schema.js";

export type DbClient = LibSQLDatabase<typeof schema>;

export const dbPlugin = (db: DbClient) => {
  return factory.createMiddleware((c, next) => {
    c.set("db", db);
    return next();
  });
};
