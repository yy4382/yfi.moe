export interface NotificationPayload {
  type:
    | "comment_reply"
    | "new_comment"
    | "comment_mention"
    | "admin_new_comment";
  recipient: string;
  data: {
    commentId?: number;
    postSlug: string;
    postTitle: string;
    commentContent?: string;
    authorName?: string;
    authorEmail?: string;
    replyTo?: string;
    parentCommentId?: number;
  };
}

export interface NotificationProvider {
  name: string;
  send(notification: NotificationPayload): Promise<void>;
  isEnabled(): boolean;
}

export interface NotificationService {
  addProvider(provider: NotificationProvider): void;
  removeProvider(name: string): void;
  send(notification: NotificationPayload): Promise<void>;
  sendBatch(notifications: NotificationPayload[]): Promise<void>;
}
