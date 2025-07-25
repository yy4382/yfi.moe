export { BaseEmailService } from "./base-email-service";
export { CommentNotificationEmailService } from "./comment-notification-email-service";
export { AuthNotificationEmailService } from "./auth-notification-email-service";
export { EmailServiceFactory } from "./email-service-factory";

// Legacy export for backward compatibility
export { EmailNotificationProvider } from "./email";

export type {
  EmailConfig,
  EmailContent,
  SendEmailOptions,
} from "./base-email-service";
