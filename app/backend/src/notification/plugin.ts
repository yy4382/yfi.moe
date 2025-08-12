import { factory } from "@/factory.js";
import { DefaultNotificationService } from "./service.js";
import type { Env } from "@/env.js";

export const notificationPlugin = (env: Env) => {
  return factory.createMiddleware(async (c, next) => {
    const service = DefaultNotificationService.createFromEnv(env);

    c.set("notification", service);
    await next();
  });
};
