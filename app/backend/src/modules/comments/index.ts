import { getComments } from "./services/get.js";
import { addComment } from "./services/add/add.js";
import { deleteComment } from "./services/delete.js";
import { updateComment } from "./services/update.js";
import { toggleCommentSpam } from "./services/toggle-spam.js";
import { factory } from "@/factory.js";
import type { Variables } from "@/factory.js";
import {
  getCommentsBody,
  getCommentsResponse,
} from "@repo/api/comment/get.model";
import {
  addCommentBody,
  addCommentResponse,
} from "@repo/api/comment/add.model";
import {
  updateCommentBody,
  updateCommentResponse,
} from "@repo/api/comment/update.model";
import {
  deleteCommentRequest,
  deleteCommentResponse,
} from "@repo/api/comment/delete.model";
import {
  toggleSpamRequest,
  toggleSpamResponse,
} from "@repo/api/comment/toggle-spam.model";
import { describeRoute, resolver, validator } from "hono-openapi";
import type { Context } from "hono";
import { commentReactionReqBody } from "@repo/api/comment/reaction.model";
import { addReaction } from "./services/reaction/add.js";
import { removeReaction } from "./services/reaction/remove.js";
import {
  actorFromUser,
  type ReactionActor,
} from "./services/reaction/types.js";
import { commentReaction } from "@repo/api/comment/comment-data";
import { ANONYMOUS_IDENTITY_HEADER } from "@/plugins/anonymous-identity.js";

type ReactionActorResolution = {
  actor: ReactionActor;
};

const resolveReactionActor = (
  c: Context<{ Variables: Variables }>,
  options: { createIfMissing?: boolean } = {},
): ReactionActorResolution | null => {
  const { createIfMissing = false } = options;
  const auth = c.get("auth");
  if (auth?.user) {
    return { actor: actorFromUser(auth.user) };
  }

  const identity = c.get("anonymousIdentity");
  if (!identity) {
    throw new Error("anonymousIdentity plugin is not registered");
  }

  if (createIfMissing) {
    const { key } = identity.ensureKey();
    return { actor: { type: "anonymous", key } };
  }

  const key = identity.getKey();
  if (!key) {
    return null;
  }

  c.header(ANONYMOUS_IDENTITY_HEADER, key, { append: false });
  return { actor: { type: "anonymous", key } };
};

const parseCommentId = (commentIdRaw: string): number | null => {
  const parsed = Number.parseInt(commentIdRaw, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
};

const commentApp = factory
  .createApp()
  .use(
    factory.createMiddleware(async (c, next) => {
      const logger = c.get("logger");
      const childLogger = logger.child({
        module: "comments",
      });
      c.set("logger", childLogger);
      return next();
    }),
  )
  // #region Get Comments
  .post(
    "/get",
    describeRoute({
      description: "Get comment list",
      tags: ["Comments"],
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: resolver(getCommentsResponse),
            },
          },
        },
      },
    }),
    validator("json", getCommentsBody),
    async (c) => {
      const body = c.req.valid("json");
      c.get("logger").debug(
        {
          path: body.path,
          sortBy: body.sortBy,
          limit: body.limit,
          offset: body.offset,
          userId: c.get("auth")?.user?.id,
        },
        "comments:get request",
      );
      const { comments, total } = await getComments(body, {
        db: c.get("db"),
        user: c.get("auth")?.user ?? null,
        logger: c.get("logger"),
      });
      const resp = getCommentsResponse.parse({ comments, total });
      c.get("logger").debug(
        { total, returned: comments.length },
        "comments:get response",
      );
      return c.json(resp, 200);
    },
  )
  // #endregion
  // #region Add Comment
  .post(
    "/add",
    describeRoute({
      description: "Add a new comment",
      tags: ["Comments"],
      responses: {
        200: {
          description: "Comment added successfully",
          content: {
            "application/json": {
              schema: resolver(addCommentResponse),
            },
          },
        },
        400: {
          description: "Bad Request",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                description: "Error message",
                example: "昵称和邮箱不能为空",
              },
            },
          },
        },
        500: {
          description: "Internal Server Error",
          content: {
            "text/plain": {
              schema: { type: "string" },
            },
          },
        },
      },
    }),
    validator("json", addCommentBody),
    async (c) => {
      const body = c.req.valid("json");

      const result = await addComment(body, {
        db: c.get("db"),
        user: c.get("auth")?.user ?? null,
        ip: c.req.header("x-forwarded-for"),
        ua: c.req.header("user-agent"),
        akismet: c.get("akismet"),
        notificationService: c.get("notification"),
        logger: c.get("logger"),
      });
      switch (result.result) {
        case "success": {
          const resp = addCommentResponse.parse(result.data);
          c.get("logger").info(
            {
              path: body.path,
              isSpam: result.data.isSpam,
              userId: c.get("auth")?.user?.id,
            },
            "comments:add success",
          );
          return c.json(resp, 200);
        }
        case "bad_req":
          c.get("logger").warn(
            { message: result.data.message },
            "comments:add bad request",
          );
          return c.text(result.data.message, 400);
        default:
          c.get("logger").error({ result }, "comments:add unexpected error");
          return c.text("Internal Server Error", 500);
      }
    },
  )
  // #endregion
  // #region Delete Comment
  .post(
    "/delete",
    describeRoute({
      description: "Delete a comment",
      tags: ["Comments"],
      responses: {
        200: {
          description: "Comment deleted successfully",
          content: {
            "application/json": {
              schema: resolver(deleteCommentResponse),
            },
          },
        },
        401: {
          description: "Not authorized: if the user is not logged in",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                description: "Error message",
                example: "Unauthorized",
              },
            },
          },
        },
        403: {
          description:
            "Forbidden: if the user does not have permission to delete the comment",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                description: "Error message",
                example: "You do not have permission to delete this comment",
              },
            },
          },
        },
        404: {
          description: "Not found: if the comment to delete does not exist",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                description: "Error message",
                example: "Comment not found",
              },
            },
          },
        },
      },
    }),
    validator("json", deleteCommentRequest),
    async (c) => {
      const body = c.req.valid("json");
      const user = c.get("auth")?.user;
      if (!user) {
        return c.text("Unauthorized", 401);
      }
      const deleteOptions = {
        db: c.get("db"),
        user,
        logger: c.get("logger"),
      };
      const result = await deleteComment(body.id, deleteOptions);
      switch (result.result) {
        case "success":
          c.get("logger").info(
            { deletedIds: result.deletedIds, userId: user.id },
            "comments:delete success",
          );
          return c.json(
            deleteCommentResponse.parse({ deletedIds: result.deletedIds }),
            200,
          );
        case "not_found":
          c.get("logger").warn(
            { commentId: body.id },
            "comments:delete not found",
          );
          return c.text(result.message, 404);
        case "forbidden":
          c.get("logger").warn(
            { commentId: body.id },
            "comments:delete forbidden",
          );
          return c.text(result.message, 403);
        default:
          c.get("logger").error({ result }, "comments:delete unexpected error");
          return c.text("Internal Server Error", 500);
      }
    },
  )
  // #endregion
  // #region Update Comment
  .post(
    "/update",
    describeRoute({
      description: "Update a comment",
      tags: ["Comments"],
      responses: {
        200: {
          description: "Comment updated successfully",
          content: {
            "application/json": {
              schema: resolver(updateCommentResponse),
            },
          },
        },
        400: {
          description: "Bad Request",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                description: "Error message",
                example: "Content cannot be empty",
              },
            },
          },
        },
        401: {
          description: "Not authorized: if the user is not logged in",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                description: "Error message",
                example: "Unauthorized",
              },
            },
          },
        },
        403: {
          description:
            "Forbidden: if the user does not have permission to update the comment",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                description: "Error message",
                example: "You do not have permission to update this comment",
              },
            },
          },
        },
        404: {
          description: "Not found: if the comment to update does not exist",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                description: "Error message",
                example: "Comment not found",
              },
            },
          },
        },
      },
    }),
    validator("json", updateCommentBody),
    async (c) => {
      const body = c.req.valid("json");
      const user = c.get("auth")?.user;
      if (!user) {
        return c.text("Unauthorized", 401);
      }
      const result = await updateComment(
        body.id,
        {
          rawContent: body.rawContent,
        },
        {
          db: c.get("db"),
          user,
          logger: c.get("logger"),
        },
      );
      switch (result.code) {
        case 200:
          c.get("logger").info(
            { commentId: body.id },
            "comments:update success",
          );
          return c.json(updateCommentResponse.parse(result.data), 200);
        case 400:
          c.get("logger").warn(
            { commentId: body.id },
            "comments:update bad request",
          );
          return c.text(result.data, 400);
        case 403:
          c.get("logger").warn(
            { commentId: body.id },
            "comments:update forbidden",
          );
          return c.text(result.data, 403);
        case 404:
          c.get("logger").warn(
            { commentId: body.id },
            "comments:update not found",
          );
          return c.text(result.data, 404);
        default:
          throw new Error("should not happen");
      }
    },
  )
  // #endregion
  // #region Reactions
  .post(
    "/reaction/:commentId/add",
    describeRoute({
      description: "Add a reaction to a comment",
      tags: ["Comments"],
      responses: {
        200: {
          description: "Reaction added",
          content: {
            "application/json": {
              schema: resolver(commentReaction),
            },
          },
        },
        400: {
          description: "Invalid comment id",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                example: "invalid comment id",
              },
            },
          },
        },
        404: {
          description: "Comment not found",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                example: "comment not found",
              },
            },
          },
        },
        500: {
          description: "Failed to add reaction",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                example: "failed to add reaction",
              },
            },
          },
        },
      },
    }),
    validator("json", commentReactionReqBody),
    async (c) => {
      const commentIdRaw = c.req.param("commentId");
      const commentId = parseCommentId(commentIdRaw);
      if (commentId === null) {
        return c.text("invalid comment id", 400);
      }

      const resolution = resolveReactionActor(c, { createIfMissing: true });
      if (!resolution) {
        return c.text("unable to resolve actor", 400);
      }
      const { actor } = resolution;

      const body = c.req.valid("json");
      const result = await addReaction(commentId, body.emoji, actor, {
        db: c.get("db"),
        logger: c.get("logger"),
      });

      switch (result.result) {
        case "success": {
          return c.json(result.data, 200);
        }
        case "not_found":
          return c.text(result.message, 404);
        case "error":
        default:
          return c.text(result.message, 500);
      }
    },
  )
  .post(
    "/reaction/:commentId/remove",
    describeRoute({
      description: "Remove a reaction from a comment",
      tags: ["Comments"],
      responses: {
        204: {
          description: "Reaction removed",
        },
        400: {
          description: "Invalid comment id",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                example: "invalid comment id",
              },
            },
          },
        },
        404: {
          description: "Comment not found",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                example: "comment not found",
              },
            },
          },
        },
        500: {
          description: "Failed to remove reaction",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                example: "failed to remove reaction",
              },
            },
          },
        },
      },
    }),
    validator("json", commentReactionReqBody),
    async (c) => {
      const commentIdRaw = c.req.param("commentId");
      const commentId = parseCommentId(commentIdRaw);
      if (commentId === null) {
        return c.text("invalid comment id", 400);
      }

      const resolution = resolveReactionActor(c, { createIfMissing: false });
      if (!resolution) {
        return c.body(null, 204);
      }

      const { actor } = resolution;
      const body = c.req.valid("json");
      const result = await removeReaction(commentId, body.emoji, actor, {
        db: c.get("db"),
        logger: c.get("logger"),
      });

      switch (result.result) {
        case "success":
          return c.body(null, 204);
        case "not_found":
          return c.text(result.message, 404);
        case "error":
        default:
          return c.text(result.message, 500);
      }
    },
  )
  // #endregion
  // #region Toggle Spam
  .post(
    "/toggle-spam",
    describeRoute({
      description: "Mark a comment as spam or not spam",
      tags: ["Comments"],
      responses: {
        200: {
          description: "Comment spam status updated successfully",
          content: {
            "application/json": {
              schema: resolver(toggleSpamResponse),
            },
          },
        },
        401: {
          description: "Not authorized: if the user is not logged in",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                description: "Error message",
                example: "Unauthorized",
              },
            },
          },
        },
        403: {
          description:
            "Forbidden: if the user does not have permission to update the comment",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                description: "Error message",
                example: "You do not have permission to perform this action",
              },
            },
          },
        },
        404: {
          description: "Not found: if the comment to  update does not exist",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                description: "Error message",
                example: "Comment not found",
              },
            },
          },
        },
      },
    }),
    validator("json", toggleSpamRequest),
    async (c) => {
      const body = c.req.valid("json");
      const user = c.get("auth")?.user;

      const result = await toggleCommentSpam(body.id, body.isSpam, {
        db: c.get("db"),
        user: user ?? null,
        akismet: c.get("akismet"),
        logger: c.get("logger"),
      });

      switch (result.code) {
        case 200:
          c.get("logger").info(
            { commentId: body.id, isSpam: body.isSpam },
            "comments:toggle-spam success",
          );
          return c.json(toggleSpamResponse.parse(result.data), 200);
        case 401:
          c.get("logger").warn(
            { commentId: body.id },
            "comments:toggle-spam 401",
          );
          return c.text(result.data, 401);
        case 403:
          c.get("logger").warn(
            { commentId: body.id },
            "comments:toggle-spam 403",
          );
          return c.text(result.data, 403);
        case 404:
          c.get("logger").warn(
            { commentId: body.id },
            "comments:toggle-spam 404",
          );
          return c.text(result.data, 404);
        default:
          throw new Error("should not happen");
      }
    },
  );

export default commentApp;
