import { and, eq, isNull, or } from "drizzle-orm";
import { canonicalizeEmoji } from "@repo/api/comment/reaction.model";
import type { DbClient } from "@/db/db-plugin.js";
import { comment, reaction } from "@/db/schema.js";
import type { ReactionActor } from "./types.js";

export type RemoveReactionResult =
  | {
      result: "success";
    }
  | {
      result: "not_found";
      message: string;
    }
  | {
      result: "error";
      message: string;
    };

export async function removeReaction(
  commentId: number,
  emojiRaw: string,
  actorOrActors: ReactionActor | readonly [ReactionActor, ...ReactionActor[]],
  options: { db: DbClient; logger?: import("pino").Logger },
): Promise<RemoveReactionResult> {
  const { db, logger } = options;
  logger?.debug({ commentId }, "reaction:remove start");

  const targetComment = await db.query.comment.findFirst({
    where: eq(comment.id, commentId),
    columns: { id: true, deletedAt: true },
  });

  if (!targetComment || targetComment.deletedAt) {
    logger?.warn({ commentId }, "reaction:remove comment not found");
    return { result: "not_found", message: "comment not found" };
  }

  const emojiKey = canonicalizeEmoji(emojiRaw);

  const actors: readonly ReactionActor[] = Array.isArray(actorOrActors)
    ? actorOrActors
    : [actorOrActors as ReactionActor];
  if (actors.length === 0) {
    logger?.warn({ commentId, emojiKey }, "reaction:remove empty actor scope");
    return { result: "success" };
  }
  const actorConditions = actors.map((actor) =>
    actor.type === "user"
      ? and(eq(reaction.actorId, actor.id), isNull(reaction.actorAnonKey))
      : and(eq(reaction.actorAnonKey, actor.key), isNull(reaction.actorId)),
  );
  const where = and(
    eq(reaction.commentId, commentId),
    eq(reaction.emojiKey, emojiKey),
    or(...actorConditions),
  );

  try {
    await db.delete(reaction).where(where);
  } catch (error) {
    logger?.error({ commentId, error }, "reaction:remove delete failed");
    return { result: "error", message: "failed to remove reaction" };
  }

  logger?.info({ commentId, emojiKey }, "reaction:remove success");
  return { result: "success" };
}
