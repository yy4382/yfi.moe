import { factory } from "@/factory";
import type * as schema from "./schema";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { Client } from "@libsql/client";

export type DbClient = LibSQLDatabase<typeof schema> & {
  $client: Client;
};

export const dbPlugin = (db: DbClient) => {
  return factory.createMiddleware((c, next) => {
    c.set("db", db);
    return next();
  });
};
