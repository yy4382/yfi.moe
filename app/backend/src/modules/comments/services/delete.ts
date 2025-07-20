import { comment, user } from "@/db/schema";
import { db as dbType } from "@/db/instance";
import { User } from "@/auth/auth";
import { and, sql, or, isNull, eq, inArray } from "drizzle-orm";

export async function deleteComment(
  id: number,
  options: { db: typeof dbType; user: User },
): Promise<{ result: "success" | "error" }> {
  const { db, user: currentUser } = options;
  const now = new Date();
  // delete if comment's user is current user or current user is admin
  const commentBeingDeleted = db.$with("comment-being-deleted").as(
    db
      .select({ id: comment.id })
      .from(comment)
      .where(
        and(
          eq(comment.id, id),
          isNull(comment.deletedAt),
          or(
            eq(comment.userId, currentUser.id),
            sql`EXISTS (
    SELECT 1 FROM ${user} WHERE ${user.id} = ${currentUser.id} AND ${user.role} = 'admin'
  )`,
          ),
        ),
      ),
  );

  const res = await options.db
    .with(commentBeingDeleted)
    .update(comment)
    .set({
      deletedAt: now,
      updatedAt: now,
    })
    .where(
      and(
        or(
          inArray(comment.id, sql`${commentBeingDeleted}`),
          inArray(comment.parentId, sql`${commentBeingDeleted}`),
        ),
        isNull(comment.deletedAt),
      ),
    )
    .returning({ id: comment.id });
  if (res.length === 0) {
    return { result: "error" };
  }
  return { result: "success" };
}
