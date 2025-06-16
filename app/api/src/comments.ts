import { Hono } from "hono";
import type { AuthVariables } from "./index.js";
import { db } from "./db/instance.js";
import { comment, user } from "./db/schema.js";
import { eq, and, isNull } from "drizzle-orm";

const commentApp = new Hono<{ Variables: AuthVariables }>();

commentApp.get("/:path", async (c) => {
  const path = c.req.param("path");
  const currentUser = c.get("user");

  const comments = await db
    .select({
      id: comment.id,
      content: comment.renderedContent,

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
      visitorWebsite: comment.visitorWebsite,
      anonymousName: comment.anonymousName,
    })
    .from(comment)
    .leftJoin(user, eq(comment.userId, user.id))
    .where(
      and(
        eq(comment.path, path),
        eq(comment.isSpam, false),
        isNull(comment.deletedAt),
      ),
    );

  const sanitizedComments = comments.map((comment) => {
    let sanitized = {
      ...comment,
      isMine: false,
      displayName:
        comment.anonymousName || comment.visitorName || comment.userName,
    };
    if (currentUser && currentUser.id === comment.userId) {
      sanitized.isMine = true;
    }
    if (currentUser?.role === "admin") {
      return sanitized;
    }
    return {
      id: sanitized.id,
      content: sanitized.content,
      parentId: sanitized.parentId,
      replyToId: sanitized.replyToId,
      createdAt: sanitized.createdAt,
      updatedAt: sanitized.updatedAt,
      displayName: sanitized.displayName,
      isMine: sanitized.isMine,
      userImage: sanitized.userImage,
    };
  });

  return c.json(sanitizedComments);
});

export { commentApp };
