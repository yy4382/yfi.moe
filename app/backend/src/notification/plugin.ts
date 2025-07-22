import { factory } from "@/factory";
import { DefaultNotificationService } from "./service";
import { EmailNotificationProvider } from "./providers/email";
import { config } from "@/config";

const createEmailProvider = () => {
  if (!config.emailNotification?.enabled) {
    return null;
  }

  return new EmailNotificationProvider({
    from: config.emailNotification.from,
    smtp: {
      host: config.emailNotification.smtp.host,
      port: config.emailNotification.smtp.port,
      secure: config.emailNotification.smtp.secure,
      auth: {
        user: config.emailNotification.smtp.auth.user,
        pass: config.emailNotification.smtp.auth.pass,
      },
    },
  });
};

export const notificationPlugin = () => {
  return factory.createMiddleware(async (c, next) => {
    const service = new DefaultNotificationService();

    const emailProvider = createEmailProvider();
    if (emailProvider) {
      service.addProvider(emailProvider);
    }

    c.set("notification", service);
    await next();
  });
};
