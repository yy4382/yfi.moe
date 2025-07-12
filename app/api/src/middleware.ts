import type { db } from "@/db/instance.js";
import { type Auth, getAuth } from "@/auth.js";
import type { Hono } from "hono";
import type { NotificationService } from "@/services/notification/notification-service.js";
import { getNotificationService } from "@/services/notification/instance.js";

export type AuthVariables = {
  user: Auth["$Infer"]["Session"]["user"] | null;
  session: Auth["$Infer"]["Session"]["session"] | null;
};

export type Variables = AuthVariables & {
  db: typeof db;
  auth: Auth;
  notificationService: NotificationService | null;
};

export function injectDeps(
  app: Hono<{ Variables: Variables }>,
  dbInstance: typeof db,
) {
  const auth = getAuth(dbInstance);
  const notificationService = getNotificationService();

  app.use("/api/*", async (c, next) => {
    c.set("db", dbInstance);
    c.set("auth", auth);
    c.set("notificationService", notificationService);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      c.set("user", null);
      c.set("session", null);
      return next();
    }

    c.set("user", session.user);
    c.set("session", session.session);
    return next();
  });

  return { auth, db: dbInstance };
}
