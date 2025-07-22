import { NotificationProvider, NotificationPayload } from "../types";
import * as nodemailer from "nodemailer";
import { render } from "@react-email/render";
import {
  CommentReplyEmail,
  NewCommentEmail,
  CommentMentionEmail,
  AdminNewCommentEmail,
} from "../templates";

export interface EmailNotificationConfig {
  from: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
}

export class EmailNotificationProvider implements NotificationProvider {
  name = "react-email";
  protected transporter: nodemailer.Transporter;
  private config: EmailNotificationConfig;

  constructor(config: EmailNotificationConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.auth,
    });
  }

  isEnabled(): boolean {
    return !!this.config.smtp.auth.user && !!this.config.smtp.auth.pass;
  }

  async send(notification: NotificationPayload): Promise<void> {
    if (!this.isEnabled()) {
      throw new Error("React Email notification provider is not configured");
    }

    const { subject, html, text } =
      await this.generateEmailContent(notification);

    await this.transporter.sendMail({
      from: this.config.from,
      to: notification.recipient,
      subject,
      text,
      html,
    });
  }

  private async generateEmailContent(notification: NotificationPayload) {
    const { type, data } = notification;

    switch (type) {
      case "comment_reply": {
        const emailComponent = CommentReplyEmail({
          authorName: data.authorName || "Anonymous",
          postTitle: data.postTitle,
          postSlug: data.postSlug,
          commentContent: data.commentContent || "",
        });

        return {
          subject: `New reply to your comment on "${data.postTitle}"`,
          html: await render(emailComponent),
          text: await render(emailComponent, { plainText: true }),
        };
      }

      case "new_comment": {
        const emailComponent = NewCommentEmail({
          authorName: data.authorName || "Anonymous",
          postTitle: data.postTitle,
          postSlug: data.postSlug,
          commentContent: data.commentContent || "",
        });

        return {
          subject: `New comment on "${data.postTitle}"`,
          html: await render(emailComponent),
          text: await render(emailComponent, { plainText: true }),
        };
      }

      case "comment_mention": {
        const emailComponent = CommentMentionEmail({
          authorName: data.authorName || "Anonymous",
          postTitle: data.postTitle,
          postSlug: data.postSlug,
          commentContent: data.commentContent || "",
        });

        return {
          subject: `You were mentioned in a comment on "${data.postTitle}"`,
          html: await render(emailComponent),
          text: await render(emailComponent, { plainText: true }),
        };
      }

      case "admin_new_comment": {
        const emailComponent = AdminNewCommentEmail({
          authorName: data.authorName || "Anonymous",
          authorEmail: data.authorEmail || "",
          postTitle: data.postTitle,
          postSlug: data.postSlug,
          commentContent: data.commentContent || "",
        });

        return {
          subject: `New comment requires moderation on "${data.postTitle}"`,
          html: await render(emailComponent),
          text: await render(emailComponent, { plainText: true }),
        };
      }

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }
  }
}
