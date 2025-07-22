import { DbClient } from "@/db/db-plugin";
import { user, comment } from "@/db/schema";
import { NotificationService } from "@/notification/types";
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

export async function sendNotification(
  comment: SendNotificationCommentData,
  db: DbClient,
  notificationService: NotificationService,
) {
  // send to admin
  sendAdminNewCommentNotification(comment, db, notificationService);

  if (comment.replyToId) {
    // send to replied to user
    sendCommentReplyNotification(
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
  if (!replyToComments || replyToComments.length === 0) {
    return;
  }
  const replyToComment = replyToComments[0];
  const repliedToEmail =
    replyToComment.user?.email || replyToComment.comment.visitorEmail;
  if (!repliedToEmail) {
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
