import type { Env } from "@/env.js";
import { factory } from "@/factory.js";
import { DefaultNotificationService } from "./service.js";

let notificationServiceSingleton: DefaultNotificationService | null = null;

export const notificationPlugin = (env: Env) => {
  return factory.createMiddleware(async (c, next) => {
    if (notificationServiceSingleton === null) {
      notificationServiceSingleton =
        DefaultNotificationService.createFromEnv(env);
    }

    c.set("notification", notificationServiceSingleton);
    await next();
  });
};
