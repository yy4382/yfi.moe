import { User } from "@/auth/auth";
import { AddCommentBody, AddCommentResponse } from "./add.model";
import type { db as dbType } from "@/db/instance";
import { comment } from "@/db/schema";

export class AddCommentError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = "AddCommentError";
  }
  toResponse() {
    return {
      message: this.message,
      error: this,
    };
  }
}

export async function addComment(
  body: AddCommentBody,
  options: { db: typeof dbType; user: User | null; ip?: string; ua?: string },
): Promise<AddCommentResponse> {
  const {
    path,
    content,
    parentId,
    replyToId,
    anonymousName,
    visitorEmail,
    visitorName,
  } = body;
  const { db, user: currentUser } = options;
  if (!currentUser && (!visitorName || !visitorEmail)) {
    throw new AddCommentError("昵称和邮箱不能为空");
  }
  const renderedContent = await parseMarkdown(content);
  const inserted = await db
    .insert(comment)
    .values({
      path,
      rawContent: content,
      renderedContent,
      parentId,
      replyToId,
      anonymousName,
      visitorEmail: currentUser ? undefined : visitorEmail,
      visitorName: currentUser ? undefined : (visitorName ?? "Anonymous"),
      isSpam: false,
      userId: currentUser?.id,
      userIp: options.ip,
      userAgent: options.ua,
    })
    .returning();

  const newComment = inserted[0];
  const commentId = newComment.id;
  return { id: commentId };
}

// TODO impl this
async function parseMarkdown(content: string) {
  return content;
}
