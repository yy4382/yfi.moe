import { factory } from "@/lib/hono/factory";
import type * as schema from "./schema";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

export type DbClient = NeonHttpDatabase<typeof schema>;

export const dbPlugin = (db: DbClient) => {
  return factory.createMiddleware((c, next) => {
    c.set("db", db);
    return next();
  });
};
