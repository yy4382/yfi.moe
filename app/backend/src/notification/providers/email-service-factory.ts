import type { EmailConfig } from "./base-email-service.js";
import { CommentNotificationEmailService } from "./comment-notification-email-service.js";
import { AuthNotificationEmailService } from "./auth-notification-email-service.js";

export class EmailServiceFactory {
  private static commentService: CommentNotificationEmailService | null = null;
  private static authService: AuthNotificationEmailService | null = null;

  /**
   * Creates or returns the singleton instance of CommentNotificationEmailService
   */
  static getCommentService(
    config: EmailConfig,
  ): CommentNotificationEmailService {
    if (!this.commentService) {
      this.commentService = new CommentNotificationEmailService(config);
    }
    return this.commentService;
  }

  /**
   * Creates or returns the singleton instance of AuthNotificationEmailService
   */
  static getAuthService(config: EmailConfig): AuthNotificationEmailService {
    if (!this.authService) {
      this.authService = new AuthNotificationEmailService(config);
    }
    return this.authService;
  }

  /**
   * Creates email config from environment variables
   */
  static createConfigFromEnv(env: {
    EMAIL_FROM: string;
    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_SECURE: boolean;
    SMTP_USER: string;
    SMTP_PASS: string;
  }): EmailConfig {
    return {
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
    };
  }

  /**
   * Resets all singleton instances (useful for testing)
   */
  static reset(): void {
    this.commentService = null;
    this.authService = null;
  }
}
