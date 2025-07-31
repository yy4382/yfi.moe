import { factory } from "@/factory.js";
import type * as schema from "./schema.js";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

export type DbClient = NeonHttpDatabase<typeof schema>;

export const dbPlugin = (db: DbClient) => {
  return factory.createMiddleware((c, next) => {
    c.set("db", db);
    return next();
  });
};
