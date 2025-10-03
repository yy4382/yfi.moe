import { and, isNull, eq } from "drizzle-orm";
import type { OneOfKeyValuePair } from "@repo/api/comment/update.model";
import type { User } from "@/auth/auth-plugin.js";
import type { DbClient } from "@/db/db-plugin.js";
import { comment } from "@/db/schema.js";
import { tablesToCommentData } from "./shared/comment-data.js";
import { parseMarkdown } from "./shared/parse-markdown.js";

export async function updateComment(
  id: number,
  content: { rawContent: string },
  options: { db: DbClient; user: User; logger?: import("pino").Logger },
): Promise<OneOfKeyValuePair> {
  const { db, user: currentUser, logger } = options;
  logger?.debug(
    { commentId: id, userId: currentUser.id },
    "updateComment:start",
  );
  const now = new Date();

  // Check if comment exists and user has permission to update
  const existingComment = await db
    .select({
      id: comment.id,
      userId: comment.userId,
      deletedAt: comment.deletedAt,
    })
    .from(comment)
    .where(and(eq(comment.id, id), isNull(comment.deletedAt)))
    .limit(1);

  if (existingComment.length === 0) {
    logger?.warn({ commentId: id }, "updateComment:not found");
    return { code: 404, data: "comment not found" };
  }

  const commentData = existingComment[0];

  if (commentData.deletedAt) {
    logger?.warn({ commentId: id }, "updateComment:already deleted");
    return { code: 400, data: "cannot update deleted comment" };
  }

  // Check if user is owner or admin
  const isOwner = commentData.userId === currentUser.id;
  const isAdmin = currentUser.role === "admin";

  if (!isOwner && !isAdmin) {
    logger?.warn(
      { commentId: id, userId: currentUser.id },
      "updateComment:forbidden",
    );
    return { code: 403, data: "not authorized to update this comment" };
  }

  // Update the comment
  const [updatedComment] = await db
    .update(comment)
    .set({
      rawContent: content.rawContent,
      renderedContent: parseMarkdown(content.rawContent),
      updatedAt: now,
    })
    .where(eq(comment.id, id))
    .returning();

  if (!updatedComment) {
    logger?.warn({ commentId: id }, "updateComment:update returned empty");
    return { code: 400, data: "cannot update deleted comment" };
  }

  logger?.info({ commentId: id }, "updateComment:success");
  return {
    code: 200,
    data: {
      result: "success",
      // TODO: maybe need to fetch reactions again, or add documentation that reactions are not included in update response
      data: tablesToCommentData(updatedComment, currentUser, [], isAdmin),
    },
  };
}
