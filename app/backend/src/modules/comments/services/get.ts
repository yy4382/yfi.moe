import { and, asc, desc, eq, gt, isNull, lt, sql } from "drizzle-orm";
import type {
  GetCommentsBody,
  LayeredCommentData,
  GetCommentsResponse,
  GetCommentsChildrenBody,
  GetCommentsChildrenResponse,
} from "@repo/api/comment/get.model";
import type { User } from "@/auth/auth-plugin.js";
import type { DbClient } from "@/db/db-plugin.js";
import { comment, reaction, user } from "@/db/schema.js";
import { tablesToCommentData } from "./shared/comment-data.js";

const DEFAULT_SUB_COMMENT_LIMIT = 3;

type CommentSelectResult = {
  comment: typeof comment.$inferSelect;
  user: typeof user.$inferSelect | null;
};

function getBaseFilters(body: GetCommentsBody, currentUser: User | null) {
  const { path } = body;
  return [
    path === null ? undefined : eq(comment.path, path),
    isNull(comment.deletedAt),
    currentUser?.role === "admin" ? undefined : eq(comment.isSpam, false),
  ];
}

function getOrderBy(sortBy: GetCommentsBody["sortBy"]) {
  switch (sortBy) {
    case "created_asc":
      return [asc(comment.createdAt), asc(comment.id)];
    case "created_desc":
    default:
      return [desc(comment.createdAt), desc(comment.id)];
  }
}

const selectToCommentData = async (
  c: CommentSelectResult,
  options: Parameters<typeof getComments>[1],
) => {
  const { db, user: currentUser } = options;
  const reactions = await db
    .select()
    .from(reaction)
    .leftJoin(user, eq(reaction.actorId, user.id))
    .where(eq(reaction.commentId, c.comment.id));
  return tablesToCommentData(
    c.comment,
    c.user,
    reactions,
    currentUser?.role === "admin",
  );
};

export async function getComments(
  body: GetCommentsBody,
  options: { db: DbClient; user: User | null; logger?: import("pino").Logger },
): Promise<GetCommentsResponse> {
  const { path, limit, cursor, sortBy } = body;
  const { db, user: currentUser, logger } = options;
  logger?.debug(
    { path, limit, cursor, sortBy, userId: currentUser?.id },
    "getComments:db query start",
  );

  const getBaseFiltersRoot = () => getBaseFilters(body, currentUser);
  const getOrderByRoot = () => getOrderBy(sortBy);

  const totalCount = await db.$count(comment, and(...getBaseFiltersRoot()));

  if (totalCount === 0) {
    return {
      total: 0,
      cursor: 0,
      hasMore: false,
      comments: [],
    };
  }

  function getRootComments(): Promise<CommentSelectResult[]> {
    if (!cursor) {
      return db
        .select()
        .from(comment)
        .leftJoin(user, eq(comment.userId, user.id))
        .where(and(...getBaseFiltersRoot(), isNull(comment.parentId)))
        .orderBy(...getOrderByRoot())
        .limit(limit + 1); // +1 to check if there's more
    }

    const cursorCreatedAt = db
      .$with("cursor_created_at")
      .as(
        db
          .select({ createdAt: comment.createdAt, id: comment.id })
          .from(comment)
          .where(eq(comment.id, cursor)),
      );

    return db
      .with(cursorCreatedAt)
      .select()
      .from(comment)
      .leftJoin(user, eq(comment.userId, user.id))
      .where(
        and(
          ...getBaseFiltersRoot(),
          isNull(comment.parentId),
          (sortBy === "created_desc" ? lt : gt)(
            sql`(${comment.createdAt}, ${comment.id})`,
            sql`((SELECT ${cursorCreatedAt.createdAt} FROM ${cursorCreatedAt}), (SELECT ${cursorCreatedAt.id} FROM ${cursorCreatedAt}))`,
          ),
        ),
      )
      .orderBy(...getOrderByRoot())
      .limit(limit + 1); // +1 to check if there's more
  }

  const getSubComments = async (
    c: CommentSelectResult,
  ): Promise<LayeredCommentData["children"]> => {
    const totalSubCount = await db.$count(
      comment,
      and(...getBaseFiltersRoot(), eq(comment.parentId, c.comment.id)),
    );
    if (totalSubCount === 0) {
      return {
        data: [],
        hasMore: false,
        cursor: 0,
        total: 0,
      };
    }
    const subComments = await db
      .select()
      .from(comment)
      .leftJoin(user, eq(comment.userId, user.id))
      .where(and(...getBaseFiltersRoot(), eq(comment.parentId, c.comment.id)))
      // always use ascending order for sub comments
      .orderBy(asc(comment.createdAt), asc(comment.id))
      .limit(DEFAULT_SUB_COMMENT_LIMIT);

    return {
      data: await Promise.all(
        subComments.map((c) => selectToCommentData(c, options)),
      ),
      hasMore: totalSubCount > subComments.length,
      cursor: subComments.at(-1)!.comment.id,
      total: totalSubCount,
    };
  };

  const rootComments = await getRootComments();
  let hasMore = false;
  if (rootComments.length === limit + 1) {
    hasMore = true;
    rootComments.pop();
  }

  const layeredComment: LayeredCommentData[] = await Promise.all(
    rootComments.map(async (c) => {
      return {
        // maybe optimize with Promise.all?
        data: await selectToCommentData(c, options),
        children: await getSubComments(c),
      };
    }),
  );

  return {
    total: totalCount,
    cursor: layeredComment.at(-1)?.data.id ?? 0,
    hasMore,
    comments: layeredComment,
  };
}

export async function getCommentsChildren(
  body: GetCommentsChildrenBody,
  options: Parameters<typeof getComments>[1],
): Promise<GetCommentsChildrenResponse> {
  const { path, rootId, limit, cursor, sortBy } = body;
  const { db, user: currentUser } = options;
  options.logger?.debug(
    { path, rootId, limit, cursor, sortBy, userId: currentUser?.id },
    "getCommentsChildren:db query start",
  );

  const getBaseFiltersChildren = () => getBaseFilters(body, currentUser);
  const getOrderByChildren = () => getOrderBy(sortBy);

  async function getChildrenComments(): Promise<CommentSelectResult[]> {
    if (!cursor) {
      return db
        .select()
        .from(comment)
        .leftJoin(user, eq(comment.userId, user.id))
        .where(and(...getBaseFiltersChildren(), eq(comment.parentId, rootId)))
        .orderBy(...getOrderByChildren())
        .limit(limit + 1); // +1 to check if there's more
    }
    const cursorCreatedAt = db
      .$with("cursor_created_at")
      .as(
        db
          .select({ createdAt: comment.createdAt, id: comment.id })
          .from(comment)
          .where(eq(comment.id, cursor)),
      );

    return db
      .with(cursorCreatedAt)
      .select()
      .from(comment)
      .leftJoin(user, eq(comment.userId, user.id))
      .where(
        and(
          ...getBaseFiltersChildren(),
          eq(comment.parentId, rootId),
          (sortBy === "created_desc" ? lt : gt)(
            sql`(${comment.createdAt}, ${comment.id})`,
            sql`((SELECT ${cursorCreatedAt.createdAt} FROM ${cursorCreatedAt}), (SELECT ${cursorCreatedAt.id} FROM ${cursorCreatedAt}))`,
          ),
        ),
      )
      .orderBy(...getOrderByChildren())
      .limit(limit + 1); // +1 to check if there's more
  }

  const comments = await getChildrenComments();
  let hasMore = false;
  if (comments.length === limit + 1) {
    hasMore = true;
    comments.pop();
  }

  return {
    data: await Promise.all(
      comments.map((c) => selectToCommentData(c, options)),
    ),
    hasMore,
    cursor: comments.at(-1)?.comment.id ?? 0,
  };
}
