import { comment } from "@/db/schema.js";
import type { DbClient } from "@/db/db-plugin.js";
import type { User } from "@/auth/auth-plugin.js";
import { and, or, isNull, eq } from "drizzle-orm";

type DeleteCommentResult =
  | {
      result: "success";
      deletedIds: number[];
    }
  | {
      result: "not_found" | "forbidden";
      message: string;
    };

export async function deleteComment(
  id: number,
  options: { db: DbClient; user: User; logger?: import("pino").Logger },
): Promise<DeleteCommentResult> {
  const { db, user: currentUser, logger } = options;
  logger?.debug(
    { commentId: id, userId: currentUser.id },
    "deleteComment:start",
  );
  const now = new Date();
  // delete if comment's user is current user or current user is admin
  const commentBeingDeleted = await db.query.comment.findFirst({
    where: and(eq(comment.id, id), isNull(comment.deletedAt)),
  });
  if (!commentBeingDeleted) {
    logger?.warn({ commentId: id }, "deleteComment:not found");
    return { result: "not_found", message: "没有找到该评论" };
  }
  if (
    commentBeingDeleted.userId !== currentUser.id &&
    currentUser.role !== "admin"
  ) {
    logger?.warn(
      { commentId: id, userId: currentUser.id },
      "deleteComment:forbidden",
    );
    return { result: "forbidden", message: "没有权限删除该评论" };
  }

  const res = await options.db
    .update(comment)
    .set({
      deletedAt: now,
      updatedAt: now,
    })
    .where(
      and(
        or(
          eq(comment.id, commentBeingDeleted.id),
          eq(comment.parentId, commentBeingDeleted.id),
        ),
        isNull(comment.deletedAt),
      ),
    )
    .returning({ id: comment.id });
  const deletedIds = res.map((r) => r.id);
  logger?.info({ commentId: id, deletedIds }, "deleteComment:success");
  return { result: "success", deletedIds };
}
