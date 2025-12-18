export { DefaultNotificationService } from "./service.js";
export { notificationPlugin } from "./plugin.js";
export type {
  NotificationService,
  NotificationPayload,
  NotificationNewReply,
  NotificationNewComment,
  NotificationProvider,
} from "./types.js";
export { EmailNotifier } from "./providers/email.js";
export { BaseTemplate } from "./templates/base-template.js";
