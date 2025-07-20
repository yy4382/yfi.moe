import { comment } from "@/db/schema";
import { db as dbType } from "@/db/instance";
import type { User } from "@/auth/auth-plugin";
import { and, isNull, eq } from "drizzle-orm";
import { parseMarkdown } from "./add";
import { OneOfKeyValuePair } from "./update.model";

export async function updateComment(
  id: number,
  content: { rawContent: string },
  options: { db: typeof dbType; user: User },
): Promise<OneOfKeyValuePair> {
  const { db, user: currentUser } = options;
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
    return { code: 404, data: "comment not found" };
  }

  const commentData = existingComment[0];

  if (commentData.deletedAt) {
    return { code: 400, data: "cannot update deleted comment" };
  }

  // Check if user is owner or admin
  const isOwner = commentData.userId === currentUser.id;
  const isAdmin = currentUser.role === "admin";

  if (!isOwner && !isAdmin) {
    return { code: 403, data: "not authorized to update this comment" };
  }

  // Update the comment
  await db
    .update(comment)
    .set({
      rawContent: content.rawContent,
      renderedContent: await parseMarkdown(content.rawContent),
      updatedAt: now,
    })
    .where(eq(comment.id, id));

  return { code: 200, data: { result: "success" } };
}
