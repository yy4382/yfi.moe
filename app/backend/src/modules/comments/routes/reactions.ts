import { describeRoute, resolver, validator } from "hono-openapi";
import { commentReaction } from "@repo/api/comment/comment-data";
import { commentReactionReqBody } from "@repo/api/comment/reaction.model";
import type { PersistenceOwner } from "@repo/guest-identity/backend";
import { factory } from "@/factory.js";
import { addReaction } from "../services/reaction/add.js";
import { removeReaction } from "../services/reaction/remove.js";
import type { ReactionActor } from "../services/reaction/types.js";

const parseCommentId = (commentIdRaw: string): number | null => {
  const parsed = Number.parseInt(commentIdRaw, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
};

const toReactionActor = (owner: PersistenceOwner): ReactionActor =>
  owner.type === "user"
    ? { type: "user", id: owner.id }
    : { type: "guest", key: owner.rawKey };

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

      const identity = c.get("guestIdentity");
      const identityScope = identity.resolve({ createGuestIfMissing: true });
      if (!identityScope.creationOwner) {
        return c.text("unable to resolve actor", 400);
      }
      const creationActor = toReactionActor(identityScope.creationOwner);
      const ownedActors = identityScope.ownedByViewer.map(toReactionActor);

      const body = c.req.valid("json");
      const result = await addReaction(commentId, body.emoji, creationActor, {
        db: c.get("db"),
        logger: c.get("logger"),
        ownedActors,
      });

      switch (result.result) {
        case "success":
          identity.commit(identityScope);
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

      const identityScope = c.get("guestIdentity").resolve();
      const ownedActors = identityScope.ownedByViewer.map(toReactionActor);
      const [firstActor, ...remainingActors] = ownedActors;
      if (!firstActor) {
        return c.body(null, 204);
      }

      const body = c.req.valid("json");
      const result = await removeReaction(
        commentId,
        body.emoji,
        [firstActor, ...remainingActors],
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
