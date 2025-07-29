import { DbClient } from "@/lib/db/db-plugin";
import { user, comment, unsubscribedEmail } from "@/lib/db/schema";
import { NotificationService } from "../../../notification/types";
import { eq } from "drizzle-orm";

type SendNotificationCommentData = {
  id: number;
  path: string;
  rawContent: string;
  renderedContent: string;
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
  return notificationService.sendBatch(
    adminEmails.map((user) => {
      return {
        type: "admin_new_comment",
        recipient: user.email,
        data: {
          commentId: comment.id,
          path: comment.path,
          rawContent: comment.rawContent,
          renderedContent: comment.renderedContent,
          userId: comment.userId,
          isSpam: comment.isSpam,
          replyToId: comment.replyToId,
          authorName: comment.name,
        },
      };
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
  console.info(isUnsubscribed, repliedToEmail);
  if (isUnsubscribed.length > 0) {
    return;
  }
  return notificationService.send({
    type: "comment_reply",
    recipient: repliedToEmail,
    data: {
      commentId: commentData.id,
      rawContent: commentData.rawContent,
      renderedContent: commentData.renderedContent,
      parentCommentId: replyToId,
      parentCommentRawContent: replyToComment.comment.rawContent,
      parentCommentRenderedContent: replyToComment.comment.renderedContent,
      parentCommentAuthorName:
        replyToComment.comment.anonymousName ||
        replyToComment.user?.name ||
        replyToComment.comment.visitorName ||
        "",
      parentCommentAuthorEmail: repliedToEmail,

      path: commentData.path,
      authorName: commentData.name,
      authorEmail: commentData.email,
    },
  });
}
