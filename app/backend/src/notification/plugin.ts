import { factory } from "@/factory.js";
import { DefaultNotificationService } from "./service.js";
import { EmailServiceFactory } from "./providers/index.js";
import { env } from "@/env.js";

const createCommentEmailProvider = () => {
  if (!env.EMAIL_NOTIFICATION_ENABLED) {
    return null;
  }

  const emailConfig = EmailServiceFactory.createConfigFromEnv(env);
  return EmailServiceFactory.getCommentService(emailConfig);
};

export const notificationPlugin = () => {
  return factory.createMiddleware(async (c, next) => {
    const service = new DefaultNotificationService();

    const commentEmailProvider = createCommentEmailProvider();
    if (commentEmailProvider) {
      service.addProvider(commentEmailProvider);
    }

    c.set("notification", service);
    await next();
  });
};
