import { Hono } from "hono";
import type { Variables } from "./middleware.js";
import { comment, user } from "./db/schema.js";
import { eq, and, isNull } from "drizzle-orm";
import { validator } from "hono/validator";
import z, { prettifyError } from "zod/v4";

const commentApp = new Hono<{ Variables: Variables }>();

export type Comment = {
  id: number;
  content: string;
  parentId: number | null;
  replyToId: number | null;
  createdAt: Date;
  updatedAt: Date;

  userImage: string | null;

  displayName: string;
  isMine: boolean;

  /**
   * Admin only
   */
  userId?: string | null;
  /**
   * Admin only
   */
  userIp?: string | null;
  /**
   * Admin only
   */
  userAgent?: string | null;
  /**
   * Admin only
   */
  userName?: string | null;
  /**
   * Admin only
   */
  userEmail?: string | null;
  /**
   * Admin only
   */
  anonymousName?: string | null;
  /**
   * Admin only
   */
  visitorName?: string | null;
  /**
   * Admin only
   */
  visitorEmail?: string | null;
};

type LayeredComment = Comment & { children: Comment[] };

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

  const sanitizedComments = comments.map((comment): Comment => {
    let sanitized = {
      ...comment,
      isMine: false,
      displayName:
        (comment.anonymousName || comment.visitorName || comment.userName) ??
        "Unknown",
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

  return c.json(layerComments(sanitizedComments));
});

const commentPostBodySchema = z.object({
  content: z.preprocess(
    (value) => {
      if (typeof value === "string") {
        return value.trim();
      }
      return value;
    },
    z.string().min(1, "Content is required"),
  ),
  parentId: z.number().nullable(),
  replyToId: z.number().nullable(),
  anonymousName: z.string().nullable(),
  visitorName: z.string().nullable(),
  visitorEmail: z.string().nullable(),
});

commentApp.post(
  "/:path",
  validator("json", (value, c) => {
    const parsed = commentPostBodySchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: prettifyError(parsed.error) }, 400);
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

    const id = await c
      .get("db")
      .insert(comment)
      .values({
        path,
        rawContent: content,
        // TODO: render content
        renderedContent: content,
        parentId,
        replyToId,
        anonymousName,
        visitorEmail: currentUser ? undefined : visitorEmail,
        visitorName: currentUser ? undefined : visitorName,
        isSpam: false,
        userId: currentUser?.id,
        userIp: c.req.header("x-forwarded-for"),
        userAgent: c.req.header("user-agent"),
      })
      .returning({ id: comment.id });

    return c.json({ id: id[0].id });
  },
);

function layerComments(comments: Comment[]): LayeredComment[] {
  const map = new Map<number, LayeredComment | { children: Comment[] }>();

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

  return Array.from(map.values()).filter(
    (value): value is LayeredComment => "id" in value,
  );
}

export { commentApp };
