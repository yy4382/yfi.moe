import type { User } from "@/lib/auth/auth-plugin";
import {
  AddCommentBody,
  addCommentResponse,
  AddCommentResponse,
} from "./add.model";
import { comment } from "@/lib/db/schema";
import { parseMarkdown } from "./parse-markdown";
import { DbClient } from "@/lib/db/db-plugin";
import z from "zod";
import { tablesToCommentData } from "./comment-data";

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
