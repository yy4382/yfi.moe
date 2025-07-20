/**
 * Should not import this file in app
 * this is only for better-auth's cli to find the config
 */

console.error("!!!!!This file (auth.ts) should not be imported in app.!!!!!");

import { db } from "@/db/instance";
import { createAuth } from "./create-auth";

export const auth = createAuth(db);
