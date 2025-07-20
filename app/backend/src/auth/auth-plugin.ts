import { factory } from "@/factory";
import { AuthClient, createAuth } from "./create-auth";

export const betterAuthPlugin = factory.createMiddleware(async (c, next) => {
  const db = c.get("db");
  const auth = createAuth(db);
  c.set("authClient", auth);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

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

type SessionResult = NonNullable<
  Awaited<ReturnType<AuthClient["api"]["getSession"]>>
>;

export type User = SessionResult["user"];
export type Session = SessionResult["session"];
