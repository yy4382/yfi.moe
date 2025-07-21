import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { config } from "@/config";

export const db = drizzle(config.dbFileName, { schema });
