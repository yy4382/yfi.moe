import { factory, type Variables } from "@/factory.js";
import commentApp from "./index.js";
import { anonymousIdentityPlugin } from "@/plugins/anonymous-identity.js";
import type { NotificationService } from "@/notification/types.js";
import pino from "pino";

export const createTestCommentApp = (
  auth: Variables["auth"] = undefined,
  db: Variables["db"] = {} as Variables["db"],
  authClient: Variables["authClient"] = {} as Variables["authClient"],
) =>
  factory
    .createApp()
    .use(anonymousIdentityPlugin())
    .use(async (c, next) => {
      c.set("db", db);
      c.set("authClient", authClient);
      c.set("auth", auth);
      c.set("notification", {} as NotificationService);
      c.set(
        "logger",
        pino({
          transport: {
            targets: [],
          },
        }),
      );
      await next();
    })
    .route("/", commentApp);
