import { NotificationProvider, NotificationPayload } from "../types";
import { BaseEmailService, EmailConfig } from "./base-email-service";
import { CommentReplyEmail, AdminNewCommentEmail } from "../templates";
import { generateUnsubscribeUrl } from "../../modules/account/unsubscribe/unsub.service";
import { siteDomain } from "@/config/site";
import { env } from "@/env";

export class CommentNotificationEmailService
  extends BaseEmailService
  implements NotificationProvider
{
  name = "comment-email-service";

  constructor(config: EmailConfig) {
    super(config);
  }

  async send(notification: NotificationPayload): Promise<void> {
    if (!this.isEnabled()) {
      throw new Error("Comment email notification service is not configured");
    }

    const { subject, html, text } =
      await this.generateEmailContent(notification);

    await this.sendEmail({
      to: notification.recipient,
      subject,
      html,
      text,
    });
  }

  private async generateEmailContent(notification: NotificationPayload) {
    const { type, data, recipient } = notification;
    const unsubscribeUrl = generateUnsubscribeUrl(
      recipient,
      env.UNSUBSCRIBE_SECRET,
      siteDomain,
    );

    switch (type) {
      case "comment_reply": {
        const emailComponent = CommentReplyEmail({
          authorName: data.authorName || "Anonymous",
          postTitle: data.path, // TODO: get post title
          postSlug: data.path,
          commentContent: data.rawContent,
          unsubscribeUrl,
        });

        const rendered = await this.renderEmailComponent(emailComponent);
        return {
          ...rendered,
          subject: `New reply to your comment on "${data.path}"`, // TODO: get post title
        };
      }

      case "admin_new_comment": {
        const emailComponent = AdminNewCommentEmail({
          authorName: data.authorName || "Anonymous",
          postTitle: data.path, // TODO: get post title
          postSlug: data.path,
          commentContent: data.rawContent,
          unsubscribeUrl,
        });

        const rendered = await this.renderEmailComponent(emailComponent);
        return {
          ...rendered,
          subject: `New comment requires moderation on "${data.path}"`, // TODO: get post title
        };
      }

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }
  }
}
