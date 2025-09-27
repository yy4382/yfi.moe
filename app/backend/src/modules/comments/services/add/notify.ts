import { eq } from "drizzle-orm";
import type { DbClient } from "@/db/db-plugin.js";
import { user, comment, unsubscribedEmail } from "@/db/schema.js";
import { env } from "@/env.js";
import { generateUnsubscribeUrl } from "@/modules/account/unsubscribe/unsub.service.js";
import { EmailNotifier } from "@/notification/providers/email.js";
import type { NotificationService } from "@/notification/types.js";
import AdminNewCommentEmail from "./notify/templates/admin-new-comment.js";
import CommentReplyEmail from "./notify/templates/comment-reply.js";

type SendNotificationCommentData = {
  id: number;
  path: string;
  rawContent: string;
  renderedContent: string;
  createdAt: Date;
  userId?: string;
  isSpam: boolean;
  replyToId?: number;
  name: string;
  email?: string;
};

export function sendNotification(
  comment: SendNotificationCommentData,
  db: DbClient,
  notificationService: NotificationService,
) {
  // send to admin
  void sendAdminNewCommentNotification(comment, db, notificationService);

  if (comment.replyToId) {
    // send to replied to user
    void sendCommentReplyNotification(
      comment,
      comment.replyToId,
      db,
      notificationService,
    );
  }
}

async function sendAdminNewCommentNotification(
  comment: SendNotificationCommentData,
  db: DbClient,
  notificationService: NotificationService,
) {
  const adminEmails = await db
    .select()
    .from(user)
    .where(eq(user.role, "admin"));
  return Promise.allSettled(
    adminEmails.map(async (adminEmail) => {
      const { html, text } = await EmailNotifier.renderEmailTemplate(
        AdminNewCommentEmail,
        {
          authorName: comment.name,
          postSlug: comment.path,
          commentContentHtml: comment.rawContent,
          commentContentText: comment.rawContent,
          frontendUrl: env.FRONTEND_URL,
          isSpam: comment.isSpam,
        },
      );
      return notificationService.email?.sendEmail({
        to: adminEmail.email,
        subject: `新评论被发布在 "${comment.path}" 上${comment.isSpam ? "（需要审核）" : ""}`,
        html,
        text,
      });
    }),
  );
}

async function sendCommentReplyNotification(
  commentData: Omit<SendNotificationCommentData, "replyToId">,
  replyToId: number,
  db: DbClient,
  notificationService: NotificationService,
) {
  const replyToComments = await db
    .select()
    .from(comment)
    .where(eq(comment.id, replyToId))
    .leftJoin(user, eq(comment.userId, user.id));
  const replyToComment = replyToComments[0];
  if (!replyToComment) {
    return;
  }
  const repliedToEmail =
    replyToComment.user?.email || replyToComment.comment.visitorEmail;
  if (!repliedToEmail) {
    return;
  }
  const isUnsubscribed = await db
    .select()
    .from(unsubscribedEmail)
    .where(eq(unsubscribedEmail.email, repliedToEmail));
  if (isUnsubscribed.length > 0) {
    return;
  }
  const unsubscribeUrl = generateUnsubscribeUrl(
    repliedToEmail,
    env.UNSUBSCRIBE_SECRET,
    env.FRONTEND_URL,
  );
  const { html, text } = await EmailNotifier.renderEmailTemplate(
    CommentReplyEmail,
    {
      authorName: commentData.name,
      postSlug: commentData.path,
      newCommentHtml: commentData.rawContent,
      newCommentText: commentData.rawContent,
      parentCommentHtml: replyToComment.comment.rawContent,
      frontendUrl: env.FRONTEND_URL,
      unsubscribeUrl,
      replyCreatedAt: formatReplyCreatedAt(commentData.createdAt),
    },
  );
  return notificationService.email?.sendEmail({
    to: repliedToEmail,
    subject: `您的评论被回复了：${commentData.rawContent.slice(0, 10)}...`,
    html,
    text,
  });
}

function formatReplyCreatedAt(createdAt: Date): string {
  const offsetMs = 8 * 60 * 60 * 1000;
  const zoned = new Date(createdAt.getTime() + offsetMs);

  const year = zoned.getUTCFullYear();
  const month = String(zoned.getUTCMonth() + 1).padStart(2, "0");
  const day = String(zoned.getUTCDate()).padStart(2, "0");
  const hours = String(zoned.getUTCHours()).padStart(2, "0");
  const minutes = String(zoned.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes} UTC+8`;
}
