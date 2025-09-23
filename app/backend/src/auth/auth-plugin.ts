import { factory } from "@/factory.js";
import { type AuthClient, createAuth } from "./create-auth.js";

let authClientSingleton: AuthClient | null = null;

export const betterAuthPlugin = factory.createMiddleware(async (c, next) => {
  const db = c.get("db");
  if (authClientSingleton === null) {
    authClientSingleton = createAuth(db);
  }
  c.set("authClient", authClientSingleton);

  const session = await authClientSingleton.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    c.set("auth", undefined);
    return next();
  }

  c.set("auth", {
    user: session.user,
    session: session.session,
  });
  return next();
});

export type User = AuthClient["$Infer"]["Session"]["user"];
export type Session = AuthClient["$Infer"]["Session"]["session"];
