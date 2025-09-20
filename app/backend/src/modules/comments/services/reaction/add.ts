import { and, eq, isNull } from "drizzle-orm";
import { comment, reaction, user } from "@/db/schema.js";
import type { DbClient } from "@/db/db-plugin.js";
import type { ReactionActor } from "./types.js";
import { canonicalizeEmoji } from "@repo/api/comment/reaction.model";
import { z } from "zod";
import { commentReaction } from "@repo/api/comment/comment-data";
import { getDiceBearUrl } from "@repo/helpers/get-gravatar-url";

export type AddReactionResult =
  | {
      result: "success";
      data: z.infer<typeof commentReaction>;
    }
  | {
      result: "not_found";
      message: string;
    }
  | {
      result: "error";
      message: string;
    };

export async function addReaction(
  commentId: number,
  emojiRaw: string,
  actor: ReactionActor,
  options: { db: DbClient; logger?: import("pino").Logger },
): Promise<AddReactionResult> {
  const { db, logger } = options;
  logger?.debug({ commentId }, "reaction:add start");

  const targetComment = await db.query.comment.findFirst({
    where: eq(comment.id, commentId),
    columns: { id: true, deletedAt: true },
  });

  if (!targetComment || targetComment.deletedAt) {
    logger?.warn({ commentId }, "reaction:add comment not found");
    return { result: "not_found", message: "comment not found" };
  }

  const emojiKey = canonicalizeEmoji(emojiRaw);

  const existing = await fetchReaction(db, commentId, emojiKey, actor);
  if (existing) {
    logger?.debug({ commentId }, "reaction:add already exists");
    return { result: "success", data: existing };
  }

  try {
    await db.insert(reaction).values({
      commentId,
      emojiKey,
      emojiRaw,
      actorId: actor.type === "user" ? actor.id : null,
      actorAnonKey: actor.type === "anonymous" ? actor.key : null,
    });
  } catch (error) {
    logger?.error({ commentId, error }, "reaction:add insert failed");
    return {
      result: "error",
      message: "failed to add reaction",
    };
  }

  const created = await fetchReaction(db, commentId, emojiKey, actor);
  if (!created) {
    logger?.error({ commentId }, "reaction:add created fetch missing");
    return {
      result: "error",
      message: "failed to add reaction",
    };
  }

  logger?.info({ commentId, emojiKey }, "reaction:add success");
  return { result: "success", data: created };
}

async function fetchReaction(
  db: DbClient,
  commentId: number,
  emojiKey: string,
  actor: ReactionActor,
): Promise<z.infer<typeof commentReaction> | null> {
  const where =
    actor.type === "user"
      ? and(
          eq(reaction.commentId, commentId),
          eq(reaction.emojiKey, emojiKey),
          eq(reaction.actorId, actor.id),
          isNull(reaction.actorAnonKey),
        )
      : and(
          eq(reaction.commentId, commentId),
          eq(reaction.emojiKey, emojiKey),
          eq(reaction.actorAnonKey, actor.key),
          isNull(reaction.actorId),
        );

  const row = await db
    .select()
    .from(reaction)
    .leftJoin(user, eq(reaction.actorId, user.id))
    .where(where)
    .limit(1);

  const data = row[0];
  if (!data) {
    return null;
  }

  if (data.reaction.actorAnonKey) {
    return commentReaction.parse({
      id: data.reaction.id,
      emojiKey: data.reaction.emojiKey,
      emojiRaw: data.reaction.emojiRaw,
      user: { type: "anonymous", key: data.reaction.actorAnonKey },
    });
  }

  if (!data.user) {
    return null;
  }

  return commentReaction.parse({
    id: data.reaction.id,
    emojiKey: data.reaction.emojiKey,
    emojiRaw: data.reaction.emojiRaw,
    user: {
      type: "user",
      id: data.user.id,
      name: data.user.name ?? "Unknown",
      image: data.user.image ?? getDiceBearUrl(data.user.id),
    },
  });
}
