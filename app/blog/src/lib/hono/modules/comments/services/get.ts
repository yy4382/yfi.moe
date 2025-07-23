import type { User } from "@/lib/auth/auth-plugin";
import type { DbClient } from "@/lib/db/db-plugin";
import type {
  GetCommentsBody,
  CommentData,
  LayeredCommentList,
  LayeredCommentData,
} from "./get.model";
import { and, asc, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { comment, user } from "@/lib/db/schema";
import crypto from "node:crypto";

export async function getComments(
  body: GetCommentsBody,
  options: { db: DbClient; user: User | null },
): Promise<{ comments: LayeredCommentList; total: number }> {
  const { path, limit, offset, sortBy } = body;
  const { db, user } = options;
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
      eq(comment.isSpam, false),
      path === null ? sql`1=1` : eq(comment.path, path),
      isNull(comment.parentId),
    ),
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
          eq(comment.isSpam, false),
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
    .select({
      id: comment.id,
      content: comment.renderedContent,
      rawContent: comment.rawContent,
      path: comment.path,

      parentId: comment.parentId,
      replyToId: comment.replyToId,

      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,

      userId: comment.userId,
      userIp: comment.userIp,
      userAgent: comment.userAgent,
      userName: user.name,
      userEmail: user.email,
      userImage: user.image,

      visitorName: comment.visitorName,
      visitorEmail: comment.visitorEmail,
      anonymousName: comment.anonymousName,
    })
    .from(comment)
    .leftJoin(user, eq(comment.userId, user.id))
    .where(
      or(
        inArray(comment.id, sql`(SELECT id FROM ${rootCommentsWith})`),
        and(
          inArray(comment.parentId, sql`(SELECT id FROM ${rootCommentsWith})`),
          isNull(comment.deletedAt),
          eq(comment.isSpam, false),
          path === null ? sql`1=1` : eq(comment.path, path),
        ),
      ),
    );
  const adminCommentData: CommentData[] = comments.map((comment) => {
    const sanitized = {
      ...comment,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      displayName:
        (comment.anonymousName || comment.visitorName || comment.userName) ??
        "Unknown",
      userImage: comment.anonymousName
        ? "https://avatar.vercel.sh/anonymous"
        : (comment.userImage ??
          getGravatarUrl(comment.userEmail ?? comment.visitorEmail ?? "")),
    };
    return sanitized;
  });

  const sanitizedComments: CommentData[] =
    currentUser?.role === "admin"
      ? adminCommentData
      : adminCommentData.map((c): CommentData => {
          const data = {
            id: c.id,
            content: c.content,
            rawContent: c.rawContent,
            parentId: c.parentId,
            replyToId: c.replyToId,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            userImage: c.userImage,
            displayName: c.displayName,
            path: c.path,
            userId: c.anonymousName ? null : c.userId,
          };
          return data;
        });
  return { comments: sanitizedComments };
}

function getGravatarUrl(
  email: string,
  size = 200,
  defaultImage = "identicon",
  rating = "g",
) {
  const cleanEmail = email.trim().toLowerCase();
  const hash = crypto.createHash("md5").update(cleanEmail).digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}&r=${rating}`;
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
