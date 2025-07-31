import type { User } from "@/auth/auth-plugin.js";
import {
  type AddCommentBody,
  addCommentResponse,
  type AddCommentResponse,
} from "@repo/api/comment/add.model";
import { comment } from "@/db/schema.js";
import { parseMarkdown } from "./parse-markdown.js";
import type { DbClient } from "@/db/db-plugin.js";
import z from "zod";
import { tablesToCommentData } from "./comment-data.js";

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
  options: { db: DbClient; user: User | null; ip?: string; ua?: string },
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
  if (!newComment) {
    return {
      result: "bad_req",
      data: { message: "failed to add comment" },
    };
  }
  return {
    result: "success",
    data: {
      data: tablesToCommentData(
        newComment,
        currentUser,
        currentUser?.role === "admin",
      ),
      isSpam: newComment.isSpam,
    } satisfies z.input<typeof addCommentResponse>,
  };
}
