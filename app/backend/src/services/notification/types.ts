import type { EmailNotifier } from "./providers/email.js";

export type NotificationPayload =
  | {
      type: "comment_reply";
      recipient: string;
      data: NotificationNewReply;
    }
  | {
      type: "admin_new_comment";
      recipient: string;
      data: NotificationNewComment;
    };

export type NotificationNewReply = {
  commentId: number;
  rawContent: string;
  renderedContent: string;

  parentCommentId: number;
  parentCommentRawContent: string;
  parentCommentRenderedContent: string;
  parentCommentAuthorName: string;
  parentCommentAuthorEmail: string;

  path: string;

  authorName: string;
  authorEmail?: string | undefined;
};

export type NotificationNewComment = {
  commentId: number;
  path: string;
  rawContent: string;
  renderedContent: string;
  authorName: string;
  authorId?: number;
  isSpam: boolean;
};

export interface NotificationProvider {
  send(notification: NotificationPayload): Promise<void>;
}

export interface NotificationService {
  email: EmailNotifier | null;
}
