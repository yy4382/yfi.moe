import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";
import { neon, neonConfig } from "@neondatabase/serverless";
import { env } from "@/env.js";

neonConfig.fetchEndpoint = (host) => {
  const [protocol, port] =
    host === "db.localtest.me" ? ["http", 4444] : ["https", 443];
  return `${protocol}://${host}:${port}/sql`;
};
const client = neon(env.DATABASE_URL);
export const db = drizzle(client, { schema });
