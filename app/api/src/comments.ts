import { Hono } from "hono";
import type { Variables } from "./middleware.js";
import { comment, user } from "./db/schema.js";
import { eq, and, isNull } from "drizzle-orm";
import { validator } from "hono/validator";
import z, { prettifyError } from "zod/v4";
import {
  commentDataUserSchema,
  commentDataAdminSchema,
  type CommentDataUser,
  type CommentDataAdmin,
} from "@repo/api-datatypes/comment";

const commentApp = new Hono<{ Variables: Variables }>();

type LayeredComment<T extends CommentDataAdmin | CommentDataUser> = T & {
  children: T[];
};

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
  parentId: z.number().optional(),
  replyToId: z.number().optional(),
  anonymousName: z.string().optional(),
  visitorName: z.string().optional(),
  visitorEmail: z.string().optional(),
});

commentApp.post(
  "/:path",
  validator("json", (value, c) => {
    console.log(value);
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

function layerComments<T extends CommentDataAdmin | CommentDataUser>(
  comments: T[],
): LayeredComment<T>[] {
  const map = new Map<number, LayeredComment<T> | { children: T[] }>();

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
    (value): value is LayeredComment<T> => "id" in value,
  );
}

export { commentApp };
