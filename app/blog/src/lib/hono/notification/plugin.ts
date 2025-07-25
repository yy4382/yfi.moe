import { factory } from "../factory";
import { DefaultNotificationService } from "./service";
import { EmailServiceFactory } from "./providers";
import { env } from "@/env";

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
