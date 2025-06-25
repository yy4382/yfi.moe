import { Hono } from "hono";
import type { Variables } from "./middleware.js";
import { comment, user } from "./db/schema.js";
import { eq, and, isNull, or, sql } from "drizzle-orm";
import { validator } from "hono/validator";
import {
  commentDataUserSchema,
  commentDataAdminSchema,
  type CommentDataUser,
  type CommentDataAdmin,
  commentPostBodySchema,
} from "@repo/api-datatypes/comment";
import SparkMD5 from "spark-md5";
import z from "zod/v4";
import { parseMarkdown } from "@repo/markdown/basic";

const commentApp = new Hono<{ Variables: Variables }>();

commentApp.get("/:path", async (c) => {
  const path = decodeURIComponent(c.req.param("path"));
  const currentUser = c.get("user");

  const comments = await c
    .get("db")
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

  const adminCommentData: CommentDataAdmin[] = comments.map((comment) => {
    let sanitized = {
      ...comment,
      isMine: false,
      displayName:
        (comment.anonymousName || comment.visitorName || comment.userName) ??
        "Unknown",
      userImage: comment.anonymousName
        ? "https://avatar.vercel.sh/anonymous"
        : (comment.userImage ??
          getGravatarUrl(comment.userEmail ?? comment.visitorEmail ?? "")),
    };
    if (currentUser && currentUser.id === comment.userId) {
      sanitized.isMine = true;
    }
    return commentDataAdminSchema.parse(sanitized satisfies CommentDataAdmin);
  });

  const sanitizedComments: CommentDataAdmin[] | CommentDataUser[] =
    currentUser?.role === "admin"
      ? adminCommentData
      : adminCommentData.map((c): CommentDataUser => {
          const data = {
            id: c.id,
            content: c.content,
            parentId: c.parentId,
            replyToId: c.replyToId,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            userImage: c.userImage,
            displayName: c.displayName,
            isMine: c.isMine,
          };
          return commentDataUserSchema.parse(data satisfies CommentDataUser);
        });

  return c.json(sanitizedComments);
});

commentApp.post(
  "/:path",
  validator("json", (value, c) => {
    console.log(value);
    const parsed = commentPostBodySchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues, type: "zod error" }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const path = decodeURIComponent(c.req.param("path"));
    const currentUser = c.get("user");

    const {
      content,
      parentId,
      replyToId,
      anonymousName,
      visitorEmail,
      visitorName,
    } = c.req.valid("json");

    if (!currentUser && (!visitorName || !visitorEmail)) {
      return c.json({ error: "昵称和邮箱不能为空", type: "data error" }, 400);
    }
    const renderedContent = await parseMarkdown(content);
    const id = await c
      .get("db")
      .insert(comment)
      .values({
        path,
        rawContent: content,
        renderedContent,
        parentId,
        replyToId,
        anonymousName,
        visitorEmail: currentUser ? undefined : visitorEmail,
        visitorName: currentUser ? undefined : (visitorName ?? "Anonymous"),
        isSpam: false,
        userId: currentUser?.id,
        userIp: c.req.header("x-forwarded-for"),
        userAgent: c.req.header("user-agent"),
      })
      .returning({ id: comment.id });

    return c.json({ id: id[0].id });
  },
);

commentApp.delete("/:id", async (c) => {
  const id = z.coerce.number().parse(c.req.param("id"));
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized", type: "auth error" }, 401);
  }

  const now = new Date();
  // delete if comment's user is current user or current user is admin
  const res = await c
    .get("db")
    .update(comment)
    .set({
      deletedAt: now,
      updatedAt: now,
    })
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
    )
    .returning({ id: comment.id });

  if (res.length === 0) {
    return c.json({ error: "Comment not found", type: "data error" }, 404);
  }

  return c.json({ success: true, id: res[0].id });
});

export { commentApp };

function getGravatarUrl(
  email: string,
  size = 200,
  defaultImage = "identicon",
  rating = "g",
) {
  const cleanEmail = email.trim().toLowerCase();
  const hash = SparkMD5.hash(cleanEmail);
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}&r=${rating}`;
}
