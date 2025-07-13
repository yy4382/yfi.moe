import type { EmailService } from "../email/index.js";
import type { EmailTemplateData } from "../email/types.js";
import { createAdminNotificationTemplate, createReplyNotificationTemplate } from "./email-templates.js";
import type { Comment } from "../../db/schema.js";
import { db } from "../../db/instance.js";
import { user } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export interface NotificationServiceConfig {
  emailService: EmailService;
  adminEmail: string;
  siteName?: string;
  siteUrl?: string;
}

export class NotificationService {
  private emailService: EmailService;
  private adminEmail: string;
  private siteName: string;
  private siteUrl: string;

  constructor(config: NotificationServiceConfig) {
    this.emailService = config.emailService;
    this.adminEmail = config.adminEmail;
    this.siteName = config.siteName || "Your Blog";
    this.siteUrl = config.siteUrl || "https://yfi.moe";
  }

  async notifyNewComment(comment: Comment): Promise<void> {
    try {
      // Send notification to admin
      await this.sendAdminNotification(comment);

      // Send notification to parent comment author (if it's a reply)
      if (comment.parentId) {
        await this.sendReplyNotification(comment);
      }
    } catch (error) {
      console.error("Error sending comment notifications:", error);
      // Don't throw - notifications should not fail the comment submission
    }
  }

  private async sendAdminNotification(comment: Comment): Promise<void> {
    const templateData = await this.buildTemplateData(comment);
    const { subject, html, text } = createAdminNotificationTemplate(templateData);

    await this.emailService.sendEmail({
      to: this.adminEmail,
      subject,
      html,
      text,
    });
  }

  private async sendReplyNotification(comment: Comment): Promise<void> {
    if (!comment.parentId || !comment.replyToId) return;

    // Get the parent comment that this is replying to
    const parentComment = await db.query.comment.findFirst({
      where: (c, { eq }) => eq(c.id, comment.replyToId),
    });

    if (!parentComment) return;

    // Get the email of the parent comment author
    let recipientEmail: string | null = null;

    if (parentComment.userId) {
      // User is logged in
      const parentUser = await db.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, parentComment.userId),
      });
      if (parentUser?.email) {
        recipientEmail = parentUser.email;
      }
    } else if (parentComment.visitorEmail) {
      // User provided email as visitor
      recipientEmail = parentComment.visitorEmail;
    }

    if (!recipientEmail) return;

    // Don't send notification to self
    if (comment.userId === parentComment.userId && 
        comment.visitorEmail === parentComment.visitorEmail) {
      return;
    }

    const templateData = await this.buildTemplateData(comment);
    const { subject, html, text } = createReplyNotificationTemplate(templateData);

    await this.emailService.sendEmail({
      to: recipientEmail,
      subject,
      html,
      text,
    });
  }

  private async buildTemplateData(comment: Comment): Promise<EmailTemplateData> {
    let commentAuthor = "Anonymous";
    
    if (comment.userId) {
      const commentUser = await db.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, comment.userId),
      });
      commentAuthor = commentUser?.name || "Anonymous";
    } else if (comment.visitorName) {
      commentAuthor = comment.visitorName;
    } else if (comment.anonymousName) {
      commentAuthor = comment.anonymousName;
    }

    const commentUrl = `${this.siteUrl}${comment.path}`;

    return {
      commentContent: comment.renderedContent,
      commentPath: comment.path,
      commentAuthor,
      commentUrl,
      siteName: this.siteName,
    };
  }
}