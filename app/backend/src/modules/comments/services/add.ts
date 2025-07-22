import type { User } from "@/auth/auth-plugin";
import { AddCommentBody, AddCommentResponse } from "./add.model";
import type { db as dbType } from "@/db/instance";
import { comment } from "@/db/schema";
import { parseMarkdown } from "./parse-markdown";

type AddCommentResult =
  | {
      result: "success";
      data: AddCommentResponse;
    }
  | {
      result: "bad_req";
      data: { message: string };
    };

export async function addComment(
  body: AddCommentBody,
  options: { db: typeof dbType; user: User | null; ip?: string; ua?: string },
): Promise<AddCommentResult> {
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
    return {
      result: "bad_req",
      data: { message: "昵称和邮箱不能为空" },
    };
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
  return {
    result: "success",
    data: { id: commentId },
  };
}
