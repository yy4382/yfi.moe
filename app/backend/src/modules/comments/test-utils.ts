import pino from "pino";
import { factory, type Variables } from "@/factory.js";
import type { NotificationService } from "@/notification/types.js";
import { anonymousIdentityPlugin } from "@/plugins/anonymous-identity.js";
import commentApp from "./index.js";

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
