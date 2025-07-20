import type { Session, User } from "../../auth/auth";
import type { db as dbType } from "../../db/instance";
import {
  getCommentsBody,
  getCommentsResponseAdmin,
  GetCommentsResponseAdmin,
  GetCommentsResponseUser,
} from "./model";
import { and, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { comment, user } from "../../db/schema";
import crypto from "node:crypto";

export async function getComments(
  body: typeof getCommentsBody.static,
  options: { db: typeof dbType; user: User; session: Session },
) {
  const { path, limit, offset } = body;
  const { db, user, session } = options;
}

async function getCommentsDb(
  db: typeof dbType,
  currentUser: User | null,
  {
    path,
    limit,
    offset,
  }: {
    path: string | null;
    limit: number;
    offset: number;
  },
) {
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
      .orderBy(desc(comment.createdAt))
      .limit(limit)
      .offset(offset),
  );
  const comments = await db
    .with(rootCommentsWith)
    .select({
      id: comment.id,
      content: comment.renderedContent,
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
  console.log(comments);

  const adminCommentData: GetCommentsResponseAdmin[] = comments.map(
    (comment) => {
      let sanitized = {
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        displayName:
          (comment.anonymousName || comment.visitorName || comment.userName) ??
          "Unknown",
        userImage: comment.anonymousName
          ? "https://avatar.vercel.sh/anonymous"
          : (comment.userImage ??
            getGravatarUrl(comment.userEmail ?? comment.visitorEmail ?? "")),
      };
      return sanitized;
    },
  );

  const sanitizedComments:
    | GetCommentsResponseAdmin[]
    | GetCommentsResponseUser[] =
    currentUser?.role === "admin"
      ? adminCommentData
      : adminCommentData.map((c): GetCommentsResponseUser => {
          const data = {
            id: c.id,
            content: c.content,
            parentId: c.parentId,
            replyToId: c.replyToId,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            userImage: c.userImage,
            displayName: c.displayName,
            path: c.path,
          };
          return data;
        });
  return sanitizedComments;
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
