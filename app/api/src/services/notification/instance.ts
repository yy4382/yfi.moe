import { NotificationService } from "./notification-service.js";
import { getEmailConfig } from "@/config/email.js";
import { AwsSesEmailService } from "@/services/email/index.js";

let notificationService: NotificationService | null = null;

export function getNotificationService(): NotificationService | null {
  if (notificationService) {
    return notificationService;
  }

  const emailConfig = getEmailConfig();
  
  if (!emailConfig.enabled) {
    console.log("Email notifications disabled");
    return null;
  }

  const emailService = new AwsSesEmailService({
    region: emailConfig.aws.region,
    accessKeyId: emailConfig.aws.accessKeyId,
    secretAccessKey: emailConfig.aws.secretAccessKey,
    fromEmail: emailConfig.aws.fromEmail,
  });

  notificationService = new NotificationService({
    emailService,
    adminEmail: emailConfig.adminEmail,
    siteName: emailConfig.siteName,
    siteUrl: emailConfig.siteUrl,
  });

  return notificationService;
}