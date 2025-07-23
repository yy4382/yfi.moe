import { factory } from "../factory";
import { DefaultNotificationService } from "./service";
import { EmailNotificationProvider } from "./providers/email";
import { env } from "@/env";

const createEmailProvider = () => {
  if (!env.EMAIL_NOTIFICATION_ENABLED) {
    return null;
  }

  return new EmailNotificationProvider({
    from: env.EMAIL_FROM,
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
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
