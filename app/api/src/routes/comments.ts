import { Hono } from "hono";
import type { Variables } from "@/middleware.js";
import { comment, user } from "@/db/schema.js";
import { eq, and, isNull, or, sql, desc, inArray } from "drizzle-orm";
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

const getCommentInputSchema = z.object({
  path: z.string(),
  limit: z.number().int().positive().optional().default(10),
  offset: z.number().int().nonnegative().optional().default(0),
});

commentApp.post(
  "/getComments",
  validator("json", (value, c) => {
    const parsed = getCommentInputSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues, type: "zod error" }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { path, limit, offset } = c.req.valid("json");
    const currentUser = c.get("user");

    const db = c.get("db");

    const sanitizedComments: CommentDataAdmin[] | CommentDataUser[] =
      await getComments(db, currentUser, { path, limit, offset });

    return c.json(sanitizedComments);
  },
);

commentApp.post(
  "/getComments/all",
  validator("json", (value, c) => {
    const parsed = z
      .object({
        limit: z.number().int().positive().optional().default(10),
        offset: z.number().int().nonnegative().optional().default(0),
      })
      .safeParse(value);
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues, type: "zod error" }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { limit, offset } = c.req.valid("json");
    const currentUser = c.get("user");
    const db = c.get("db");
    const sanitizedComments: CommentDataAdmin[] | CommentDataUser[] =
      await getComments(db, currentUser, {
        path: null,
        limit,
        offset,
      });
    return c.json(sanitizedComments);
  },
);

commentApp.post(
  "/addComment",
  validator("json", (value, c) => {
    console.log(value);
    const parsed = commentPostBodySchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues, type: "zod error" }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const {
      path,
      content,
      parentId,
      replyToId,
      anonymousName,
      visitorEmail,
      visitorName,
    } = c.req.valid("json");
    const currentUser = c.get("user");

    if (!currentUser && (!visitorName || !visitorEmail)) {
      return c.json({ error: "昵称和邮箱不能为空", type: "data error" }, 400);
    }
    const renderedContent = await parseMarkdown(content);
    const inserted = await c
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
      .returning();

    const newComment = inserted[0];
    const commentId = newComment.id;

    // Send notifications asynchronously (don't await)
    const notificationService = c.get("notificationService");
    if (notificationService) {
      // Don't await - run in background
      notificationService.notifyNewComment(newComment).catch(error => {
        console.error("Failed to send comment notification:", error);
      });
    }

    return c.json({ id: commentId });
  },
);

commentApp.delete(
  "/deleteComment",
  validator("json", (value, c) => {
    const parsed = z
      .object({
        id: z.number(),
      })
      .safeParse(value);
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues, type: "zod error" }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { id } = c.req.valid("json");
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
  },
);

export { commentApp };

async function getComments(
  db: Variables["db"],
  currentUser: Variables["user"],
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
            path: c.path,
          };
          return commentDataUserSchema.parse(data satisfies CommentDataUser);
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
  const hash = SparkMD5.hash(cleanEmail);
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}&r=${rating}`;
}
