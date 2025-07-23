import { comment } from "@/lib/db/schema";
import type { DbClient } from "@/lib/db/db-plugin";
import type { User } from "@/lib/auth/auth-plugin";
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
  options: { db: DbClient; user: User },
): Promise<DeleteCommentResult> {
  const { db, user: currentUser } = options;
  const now = new Date();
  // delete if comment's user is current user or current user is admin
  const commentBeingDeleted = await db.query.comment.findFirst({
    where: and(eq(comment.id, id), isNull(comment.deletedAt)),
  });
  if (!commentBeingDeleted) {
    return { result: "not_found", message: "没有找到该评论" };
  }
  if (
    commentBeingDeleted.userId !== currentUser.id &&
    currentUser.role !== "admin"
  ) {
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
  return { result: "success", deletedIds: res.map((r) => r.id) };
}
