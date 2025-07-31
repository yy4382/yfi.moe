export { BaseEmailService } from "./base-email-service.js";
export { CommentNotificationEmailService } from "./comment-notification-email-service.js";
export { AuthNotificationEmailService } from "./auth-notification-email-service.js";
export { EmailServiceFactory } from "./email-service-factory.js";

// Legacy export for backward compatibility
export { EmailNotificationProvider } from "./email.js";

export type {
  EmailConfig,
  EmailContent,
  SendEmailOptions,
} from "./base-email-service.js";
