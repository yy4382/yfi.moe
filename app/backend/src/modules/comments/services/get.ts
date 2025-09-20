import type { User } from "@/auth/auth-plugin.js";
import type { DbClient } from "@/db/db-plugin.js";
import type {
  GetCommentsBody,
  LayeredCommentList,
  LayeredCommentData,
} from "@repo/api/comment/get.model";
import { and, asc, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { comment, reaction, user } from "@/db/schema.js";
import { tablesToCommentData } from "./shared/comment-data.js";
import type { CommentData } from "@repo/api/comment/comment-data";

export async function getComments(
  body: GetCommentsBody,
  options: { db: DbClient; user: User | null; logger?: import("pino").Logger },
): Promise<{ comments: LayeredCommentList; total: number }> {
  const { path, limit, offset, sortBy } = body;
  const { db, user, logger } = options;
  logger?.debug(
    { path, limit, offset, sortBy, userId: user?.id },
    "getComments:db query start",
  );
  const { comments } = await getCommentsDb(db, user, {
    path,
    limit,
    offset,
    sortBy,
  });
  const layeredComments = layerComments(comments, sortBy);
  const totalCount = await db.$count(
    comment,
    and(
      isNull(comment.deletedAt),
      user?.role === "admin" ? sql`1=1` : eq(comment.isSpam, false),
      path === null ? sql`1=1` : eq(comment.path, path),
      isNull(comment.parentId),
    ),
  );
  logger?.debug(
    { total: totalCount, returned: layeredComments.length },
    "getComments:db query done",
  );
  return { comments: layeredComments, total: totalCount };
}

async function getCommentsDb(
  db: DbClient,
  currentUser: User | null,
  {
    path,
    limit,
    offset,
    sortBy,
  }: {
    path: string | null;
    limit: number;
    offset: number;
    sortBy: GetCommentsBody["sortBy"];
  },
): Promise<{ comments: CommentData[] }> {
  const rootCommentsWith = db.$with("root_comments").as(
    db
      .select({ id: comment.id })
      .from(comment)
      .where(
        and(
          path === null ? sql`1=1` : eq(comment.path, path),
          isNull(comment.parentId),
          isNull(comment.deletedAt),
          currentUser?.role === "admin" ? sql`1=1` : eq(comment.isSpam, false),
        ),
      )
      .orderBy(
        sortBy === "created_desc"
          ? desc(comment.createdAt)
          : asc(comment.createdAt),
      )
      .limit(limit)
      .offset(offset),
  );
  const comments = await db
    .with(rootCommentsWith)
    .select()
    .from(comment)
    .leftJoin(user, eq(comment.userId, user.id))
    .where(
      or(
        inArray(comment.id, sql`(SELECT id FROM ${rootCommentsWith})`),
        and(
          inArray(comment.parentId, sql`(SELECT id FROM ${rootCommentsWith})`),
          isNull(comment.deletedAt),
          currentUser?.role === "admin" ? sql`1=1` : eq(comment.isSpam, false),
          path === null ? sql`1=1` : eq(comment.path, path),
        ),
      ),
    );
  const commentsWithReactions = await Promise.all(
    comments.map(async (c) => {
      const reactions = await db
        .select()
        .from(reaction)
        .leftJoin(user, eq(reaction.actorId, user.id))
        .where(eq(reaction.commentId, c.comment.id));
      return { ...c, reactions };
    }),
  );

  return {
    comments: commentsWithReactions.map((comment) => {
      return tablesToCommentData(
        comment.comment,
        comment.user,
        comment.reactions,
        currentUser?.role === "admin",
      );
    }),
  };
}

function layerComments(
  comments: CommentData[],
  sortBy: GetCommentsBody["sortBy"],
): LayeredCommentData[] {
  const map = new Map<
    number,
    LayeredCommentData | { children: CommentData[] }
  >();

  for (const comment of comments) {
    if (comment.parentId === null) {
      map.set(comment.id, {
        ...comment,
        children: map.get(comment.id)?.children ?? [],
      });
    } else {
      const parent = map.get(comment.parentId);
      if (parent) {
        parent.children.push(comment);
      } else {
        map.set(comment.parentId, {
          children: [],
        });
      }
    }
  }

  return Array.from(map.values())
    .filter((value): value is LayeredCommentData => "id" in value)
    .sort((a, b) =>
      sortBy === "created_desc"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .map((entry) => {
      return {
        ...entry,
        children: entry.children.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
      };
    });
}
