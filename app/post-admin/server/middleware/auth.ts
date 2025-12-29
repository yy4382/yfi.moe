import { HTTPException } from "hono/http-exception";
import { env } from "../env.js";
import { factory } from "../factory.js";

export const authMiddleware = factory.createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Missing authorization" });
  }

  const token = authHeader.slice(7);
  if (token !== env.AUTH_TOKEN) {
    throw new HTTPException(401, { message: "Invalid token" });
  }

  c.set("isAuthenticated", true);
  return next();
});
