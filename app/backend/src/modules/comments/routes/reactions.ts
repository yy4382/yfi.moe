import type { Context } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { commentReaction } from "@repo/api/comment/comment-data";
import { commentReactionReqBody } from "@repo/api/comment/reaction.model";
import { factory, type Variables } from "@/factory.js";
import { ANONYMOUS_IDENTITY_HEADER } from "@/plugins/anonymous-identity.js";
import { addReaction } from "../services/reaction/add.js";
import { removeReaction } from "../services/reaction/remove.js";
import {
  actorFromUser,
  type ReactionActor,
} from "../services/reaction/types.js";

const parseCommentId = (commentIdRaw: string): number | null => {
  const parsed = Number.parseInt(commentIdRaw, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
};

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

export const reactionRoutes = factory
  .createApp()
  .post(
    "/:commentId/add",
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
      const commentId = parseCommentId(c.req.param("commentId"));
      if (commentId === null) {
        return c.text("invalid comment id", 400);
      }

      const resolution = resolveReactionActor(c, { createIfMissing: true });
      if (!resolution) {
        return c.text("unable to resolve actor", 400);
      }

      const body = c.req.valid("json");
      const result = await addReaction(
        commentId,
        body.emoji,
        resolution.actor,
        {
          db: c.get("db"),
          logger: c.get("logger"),
        },
      );

      switch (result.result) {
        case "success":
          return c.json(result.data, 200);
        case "not_found":
          return c.text(result.message, 404);
        case "error":
        default:
          return c.text(result.message, 500);
      }
    },
  )
  .post(
    "/:commentId/remove",
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
      const commentId = parseCommentId(c.req.param("commentId"));
      if (commentId === null) {
        return c.text("invalid comment id", 400);
      }

      const resolution = resolveReactionActor(c, { createIfMissing: false });
      if (!resolution) {
        return c.body(null, 204);
      }

      const body = c.req.valid("json");
      const result = await removeReaction(
        commentId,
        body.emoji,
        resolution.actor,
        {
          db: c.get("db"),
          logger: c.get("logger"),
        },
      );

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
  );
